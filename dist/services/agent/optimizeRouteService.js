"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptimizedRoutes = void 0;
const client_1 = require("@prisma/client");
const geoUtils_1 = require("../../utils/geoUtils");
const prisma = new client_1.PrismaClient();
const getOptimizedRoutes = async (userId, startLat, startLon) => {
    var _a, _b, _c, _d;
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
        var _a, _b, _c, _d, _e;
        // Find the correct address
        const targetAddressId = delivery.deliveryAddressId ||
            (delivery.deliveryType === "PICKUP" ? delivery.order.pickupAddressId : delivery.order.deliveryAddressId);
        let address = (_a = delivery.customer) === null || _a === void 0 ? void 0 : _a.addresses.find((a) => a.id === targetAddressId);
        // Fallback to default address if specific one not found
        if (!address) {
            address = ((_b = delivery.customer) === null || _b === void 0 ? void 0 : _b.addresses.find((a) => a.isDefault)) || ((_c = delivery.customer) === null || _c === void 0 ? void 0 : _c.addresses[0]);
        }
        // Fallback coordinates if address lat/lon is null in DB
        const fallbackLat = 23.7900 + (parseInt(delivery.id.slice(-4), 16) % 60) * 0.0012;
        const fallbackLon = 90.4000 + (parseInt(delivery.id.slice(-4), 16) % 60) * 0.0012;
        return {
            delivery,
            address,
            lat: (_d = address === null || address === void 0 ? void 0 : address.latitude) !== null && _d !== void 0 ? _d : fallbackLat,
            lon: (_e = address === null || address === void 0 ? void 0 : address.longitude) !== null && _e !== void 0 ? _e : fallbackLon,
            visited: false,
        };
    });
    const validStops = stops;
    const unmappedStops = [];
    const optimizedSequence = [];
    // 3. Start from Agent Live Location if available, else Branch coordinates
    let currentLat = (_b = startLat !== null && startLat !== void 0 ? startLat : (_a = agent.branch) === null || _a === void 0 ? void 0 : _a.latitude) !== null && _b !== void 0 ? _b : 23.8103; // Default to Dhaka if missing
    let currentLon = (_d = startLon !== null && startLon !== void 0 ? startLon : (_c = agent.branch) === null || _c === void 0 ? void 0 : _c.longitude) !== null && _d !== void 0 ? _d : 90.4125;
    let accumulatedDistance = 0;
    // 4. Nearest-Neighbor Algorithm
    while (optimizedSequence.length < validStops.length) {
        let nearestStop = null;
        let minDistance = Infinity;
        for (const stop of validStops) {
            if (!stop.visited) {
                const dist = (0, geoUtils_1.calculateDistance)(currentLat, currentLon, stop.lat, stop.lon);
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestStop = stop;
                }
            }
        }
        if (nearestStop) {
            nearestStop.visited = true;
            accumulatedDistance += minDistance;
            optimizedSequence.push(Object.assign(Object.assign({}, nearestStop), { distanceFromLast: minDistance, accumulatedDistance }));
            currentLat = nearestStop.lat;
            currentLon = nearestStop.lon;
        }
        else {
            break;
        }
    }
    // 5. Combine optimized stops with unmapped stops at the end
    const finalSequence = [...optimizedSequence, ...unmappedStops.map(s => (Object.assign(Object.assign({}, s), { distanceFromLast: 0, accumulatedDistance: 0 })))];
    // 6. Map to the response format expected by the frontend
    return finalSequence.map((stop, index) => {
        var _a, _b, _c, _d, _e, _f;
        const d = stop.delivery;
        // Assuming 20km/h average speed in city traffic (0.05 hours per km = 3 mins per km)
        const estimatedMins = stop.accumulatedDistance ? Math.ceil(stop.accumulatedDistance * 3) : 0;
        const estTimeStr = estimatedMins > 0 ? `${estimatedMins} mins` : "N/A";
        return {
            id: d.id,
            routeName: `Stop ${index + 1}: ${d.deliveryType === 'PICKUP' ? 'Pickup' : 'Drop-off'}`,
            startLocation: index === 0 ? "Branch" : (_b = (_a = finalSequence[index - 1].address) === null || _a === void 0 ? void 0 : _a.fullAddress) !== null && _b !== void 0 ? _b : "Previous Stop",
            endLocation: (_d = (_c = stop.address) === null || _c === void 0 ? void 0 : _c.fullAddress) !== null && _d !== void 0 ? _d : "Customer Address",
            latitude: stop.lat,
            longitude: stop.lon,
            totalStops: finalSequence.length,
            totalDistance: stop.accumulatedDistance ? `${stop.accumulatedDistance.toFixed(2)} KM` : "N/A",
            estimatedTime: estTimeStr,
            pickups: finalSequence.filter(s => s.delivery.deliveryType === 'PICKUP').length,
            deliveries: finalSequence.filter(s => s.delivery.deliveryType === 'DROP_OFF').length,
            status: d.deliveryStatus,
            type: d.deliveryType,
            customerName: ((_e = stop.address) === null || _e === void 0 ? void 0 : _e.receiverName) || "Customer",
            phone: ((_f = stop.address) === null || _f === void 0 ? void 0 : _f.receiverPhone) || "",
        };
    });
};
exports.getOptimizedRoutes = getOptimizedRoutes;
