import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DeliveryAssignmentService {
  /**
   * Automatically creates a DROP_OFF delivery record for an order
   * and assigns it to an available local agent.
   */
  static async autoAssignDropoffDelivery(orderId: string) {
    // 1. Fetch the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { branch: true }
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found for automated delivery assignment.`);
    }

    if (!order.branchId) {
      console.log(`[AutoAssign] Order ${orderId} has no branch assigned, cannot automate DROP_OFF.`);
      return null;
    }

    // 2. Check if a drop-off delivery record already exists to prevent duplicates
    const existingDelivery = await prisma.delivery.findFirst({
      where: { orderId: orderId, deliveryType: 'DROP_OFF' }
    });

    if (existingDelivery) {
      console.log(`[AutoAssign] DROP_OFF delivery already exists for Order ${orderId}. Skipping automation.`);
      return existingDelivery;
    }

    // 3. Find an available agent in the branch
    const availableAgent = await prisma.deliveryAgent.findFirst({
      where: {
        branchId: order.branchId,
        status: 'ACTIVE',
        availability: true,
      },
    });

    const agentId = availableAgent ? availableAgent.id : null;

    // 4. Create the Delivery Record
    const delivery = await prisma.delivery.create({
      data: {
        orderId: order.id,
        customerId: order.customerId,
        branchId: order.branchId,
        deliveryNumber: `DEL-${Date.now().toString().slice(-6)}-${order.orderNumber || order.id.substring(0, 4)}`,
        deliveryType: 'DROP_OFF',
        deliveryStatus: agentId ? 'ASSIGNED' : 'PENDING',
        assignedAgentId: agentId,
        deliveryAddressId: order.deliveryAddressId, // Make sure deliveryAddressId is used for DROP_OFF
      }
    });

    // 5. Update the parent order to link the newly assigned agent
    if (agentId) {
      await prisma.order.update({
        where: { id: order.id },
        data: { deliveryAgentId: agentId }
      });
      console.log(`[AutoAssign] Successfully created DROP_OFF delivery ${delivery.id} and assigned agent ${agentId}.`);
    } else {
      console.log(`[AutoAssign] Created DROP_OFF delivery ${delivery.id} but no agent was available for branch ${order.branchId}. Needs manual assignment.`);
    }

    return delivery;
  }
}
