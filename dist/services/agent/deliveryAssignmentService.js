"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryAssignmentService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class DeliveryAssignmentService {
    /**
     * Automatically creates a DROP_OFF delivery record for an order
     * and assigns it to an available local agent.
     */
    static async autoAssignDropoffDelivery(orderId) {
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
        // 3. Create the DROP_OFF as PENDING (unassigned) so any branch agent can self-claim it.
        //    Do NOT pre-assign to a random agent — that would make it invisible to everyone else.
        const delivery = await prisma.delivery.create({
            data: {
                orderId: order.id,
                customerId: order.customerId,
                branchId: order.branchId,
                deliveryNumber: `DEL-${Date.now().toString().slice(-6)}-${order.orderNumber || order.id.substring(0, 4)}`,
                deliveryType: 'DROP_OFF',
                deliveryStatus: 'PENDING',
                assignedAgentId: null,
                deliveryAddressId: order.deliveryAddressId,
            }
        });
        console.log(`[AutoAssign] Created DROP_OFF delivery ${delivery.id} for branch ${order.branchId}. Any branch agent can now self-claim it.`);
        return delivery;
    }
}
exports.DeliveryAssignmentService = DeliveryAssignmentService;
