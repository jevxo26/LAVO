import prisma from "../../config/prisma";
import { PrismaClient } from "@prisma/client";
import { calculateDistance } from "../../utils/geoUtils";

export const getOptimizedRoutes = async (userId: string, startLat?: number, startLon?: number) => {
  const agent = await prisma.deliveryAgent.findUnique({
    where: { userId },
    include: { branch: true },
  });

  if (!agent) {
    throw new Error("Delivery agent not found");
  }

  // 1. Fetch all active deliveries assigned to this agent
  const deliveries = await prisma.delivery.findMany({
    where: {
      assignedAgentId: agent.id,
      deliveryStatus: {
        in: ["ACCEPTED", "IN_PROGRESS"],
      },
    },
    include: {
      customer: {
        include: {
          addresses: true,
        },
      },
      order: true,
    },
  });

  if (deliveries.length === 0) {
    return [];
  }

  // 2. Map deliveries to standard 'Stops' with valid coordinates
  let stops = deliveries.map((delivery, index) => {
    // Find the correct address
    const targetAddressId = delivery.deliveryAddressId || 
      (delivery.deliveryType === "PICKUP" ? delivery.order.pickupAddressId : delivery.order.deliveryAddressId);
      
    let address = delivery.customer?.addresses.find((a) => a.id === targetAddressId);
    
    // Fallback to default address if specific one not found
    if (!address) {
      address = delivery.customer?.addresses.find((a) => a.isDefault) || delivery.customer?.addresses[0];
    }

    // Fallback coordinates if address lat/lon is null in DB
    const fallbackLat = 23.7900 + (parseInt(delivery.id.slice(-4), 16) % 60) * 0.0012;
    const fallbackLon = 90.4000 + (parseInt(delivery.id.slice(-4), 16) % 60) * 0.0012;

    return {
      delivery,
      address,
      lat: address?.latitude ?? fallbackLat,
      lon: address?.longitude ?? fallbackLon,
      visited: false,
    };
  });

  const validStops = stops;
  const unmappedStops: typeof stops = [];

  const optimizedSequence = [];
  
  // 3. Start from Agent Live Location if available, else Branch coordinates
  let currentLat = startLat ?? agent.branch?.latitude ?? 23.8103; // Default to Dhaka if missing
  let currentLon = startLon ?? agent.branch?.longitude ?? 90.4125;

  let accumulatedDistance = 0;

  // 4. Nearest-Neighbor Algorithm
  while (optimizedSequence.length < validStops.length) {
    let nearestStop = null;
    let minDistance = Infinity;

    for (const stop of validStops) {
      if (!stop.visited) {
        const dist = calculateDistance(currentLat, currentLon, stop.lat!, stop.lon!);
        if (dist < minDistance) {
          minDistance = dist;
          nearestStop = stop;
        }
      }
    }

    if (nearestStop) {
      nearestStop.visited = true;
      accumulatedDistance += minDistance;
      optimizedSequence.push({
        ...nearestStop,
        distanceFromLast: minDistance,
        accumulatedDistance,
      });
      currentLat = nearestStop.lat!;
      currentLon = nearestStop.lon!;
    } else {
      break;
    }
  }

  // 5. Combine optimized stops with unmapped stops at the end
  const finalSequence = [...optimizedSequence, ...unmappedStops.map(s => ({ ...s, distanceFromLast: 0, accumulatedDistance: 0 }))];

  // 6. Map to the response format expected by the frontend
  return finalSequence.map((stop, index) => {
    const d = stop.delivery;
    // Assuming 20km/h average speed in city traffic (0.05 hours per km = 3 mins per km)
    const estimatedMins = stop.accumulatedDistance ? Math.ceil(stop.accumulatedDistance * 3) : 0;
    const estTimeStr = estimatedMins > 0 ? `${estimatedMins} mins` : "N/A";

    return {
      id: d.id,
      routeName: `Stop ${index + 1}: ${d.deliveryType === 'PICKUP' ? 'Pickup' : 'Drop-off'}`,
      startLocation: index === 0 ? "Branch" : finalSequence[index - 1].address?.fullAddress ?? "Previous Stop",
      endLocation: stop.address?.fullAddress ?? "Customer Address",
      latitude: stop.lat,
      longitude: stop.lon,
      totalStops: finalSequence.length,
      totalDistance: stop.accumulatedDistance ? `${stop.accumulatedDistance.toFixed(2)} KM` : "N/A",
      estimatedTime: estTimeStr,
      pickups: finalSequence.filter(s => s.delivery.deliveryType === 'PICKUP').length,
      deliveries: finalSequence.filter(s => s.delivery.deliveryType === 'DROP_OFF').length,
      status: d.deliveryStatus,
      type: d.deliveryType,
      customerName: stop.address?.receiverName || "Customer",
      phone: stop.address?.receiverPhone || "",
    };
  });
};