"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationTriggers = void 0;
const NotificationService_1 = require("./NotificationService");
class NotificationTriggers {
    // ==========================================
    // SUPER ADMIN & ADMIN SCOPE
    // ==========================================
    /** Triggered on new Vendor or Branch registration awaiting approval */
    static async notifyAdminsOnRegistration(entityName, entityType) {
        const title = `New ${entityType === "VENDOR" ? "Vendor Partner" : "Branch"} Registration`;
        const body = `${entityName} has submitted a new application and is awaiting approval.`;
        return NotificationService_1.NotificationService.sendToRoles(["SUPER_ADMIN", "ADMIN"], title, body, {
            type: "REGISTRATION_APPROVAL",
            entityName,
            entityType,
        });
    }
    /** Triggered on capacity overload (e.g. > 90% processing limit) */
    static async notifyAdminsOnCapacityOverload(facilityName, usagePercent) {
        const title = "⚠️ Capacity Overload Alert";
        const body = `${facilityName} capacity has reached ${usagePercent}%. Immediate re-balancing required.`;
        return NotificationService_1.NotificationService.sendToRoles(["SUPER_ADMIN", "ADMIN"], title, body, {
            type: "CAPACITY_OVERLOAD",
            facilityName,
            usagePercent: String(usagePercent),
        });
    }
    /** Triggered on high-priority support ticket escalation */
    static async notifyAdminsOnSupportTicket(ticketId, subject) {
        const title = `High-Priority Support Ticket #${ticketId}`;
        const body = `Escalated Issue: "${subject}". Attention required.`;
        return NotificationService_1.NotificationService.sendToRoles(["SUPER_ADMIN", "ADMIN"], title, body, {
            type: "SUPPORT_TICKET_ESCALATED",
            ticketId,
        });
    }
    // ==========================================
    // VENDOR & BRANCH MANAGER SCOPE
    // ==========================================
    /** Triggered when a new order/lot is assigned */
    static async notifyVendorOrBranchOnNewOrder(managerUserId, orderNumber) {
        const title = "New Order Assigned 🧺";
        const body = `Order #${orderNumber} has been assigned to your facility for processing.`;
        return NotificationService_1.NotificationService.sendToUser(managerUserId, title, body, {
            type: "NEW_ORDER_ASSIGNED",
            orderNumber,
        });
    }
    /** Triggered when inventory stock drops below minimum threshold */
    static async notifyVendorOrBranchOnLowStock(managerUserId, itemName, currentStock) {
        const title = "📦 Low Inventory Alert";
        const body = `${itemName} stock is low (${currentStock} units remaining). Please restock soon.`;
        return NotificationService_1.NotificationService.sendToUser(managerUserId, title, body, {
            type: "LOW_STOCK_ALERT",
            itemName,
            currentStock: String(currentStock),
        });
    }
    /** Triggered when a pickup agent arrives at the facility */
    static async notifyVendorOrBranchOnPickupArrival(managerUserId, agentName, orderNumber) {
        const title = "Agent Arrival 🚚";
        const body = `Pickup agent ${agentName} has arrived for Order #${orderNumber}.`;
        return NotificationService_1.NotificationService.sendToUser(managerUserId, title, body, {
            type: "AGENT_ARRIVAL",
            orderNumber,
            agentName,
        });
    }
    // ==========================================
    // DELIVERY AGENT SCOPE
    // ==========================================
    /** Triggered when a new route or delivery task is assigned */
    static async notifyAgentOnAssignedRoute(agentUserId, totalPickups) {
        const title = "New Dispatch Route Assigned 🗺️";
        const body = `You have been assigned a new route with ${totalPickups} order stop(s).`;
        return NotificationService_1.NotificationService.sendToUser(agentUserId, title, body, {
            type: "ROUTE_ASSIGNED",
            totalPickups: String(totalPickups),
        });
    }
    /** Triggered when a customer cancels an active order en route */
    static async notifyAgentOnCustomerCancellation(agentUserId, orderNumber) {
        const title = "Order Cancelled 🚫";
        const body = `Order #${orderNumber} was cancelled by the customer. Route auto-updated.`;
        return NotificationService_1.NotificationService.sendToUser(agentUserId, title, body, {
            type: "ORDER_CANCELLED",
            orderNumber,
        });
    }
    // ==========================================
    // CUSTOMER SCOPE
    // ==========================================
    /** Triggered on order status updates */
    static async notifyCustomerOnStatusChange(customerUserId, orderNumber, status) {
        const formattedStatus = status.replace(/_/g, " ");
        const title = `Order #${orderNumber} Update`;
        const body = `Your order status is now: ${formattedStatus}.`;
        return NotificationService_1.NotificationService.sendToUser(customerUserId, title, body, {
            type: "ORDER_STATUS_UPDATE",
            orderNumber,
            status,
        });
    }
    /** Triggered on successful payment or delivery */
    static async notifyCustomerOnPaymentSuccess(customerUserId, orderNumber, amount) {
        const title = "Payment Successful ✅";
        const body = `Payment of ৳${amount} for Order #${orderNumber} was confirmed.`;
        return NotificationService_1.NotificationService.sendToUser(customerUserId, title, body, {
            type: "PAYMENT_SUCCESS",
            orderNumber,
            amount: String(amount),
        });
    }
    /** Triggered on wallet balance updates */
    static async notifyCustomerOnWalletUpdate(customerUserId, amount, newBalance) {
        const isCredit = amount > 0;
        const title = isCredit ? "Wallet Credited 💳" : "Wallet Debited 💳";
        const body = `৳${Math.abs(amount)} ${isCredit ? "credited to" : "debited from"} your wallet. New balance: ৳${newBalance}.`;
        return NotificationService_1.NotificationService.sendToUser(customerUserId, title, body, {
            type: "WALLET_UPDATE",
            amount: String(amount),
            newBalance: String(newBalance),
        });
    }
}
exports.NotificationTriggers = NotificationTriggers;
