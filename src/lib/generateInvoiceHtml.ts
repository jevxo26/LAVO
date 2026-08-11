import { OrderRecord, fmtDate, fmtDateTime } from "@/components/dashboard/(customer)/orders/types";

export function generateInvoiceHtml(order: OrderRecord, customerName?: string, customerPhone?: string, customerEmail?: string): string {
  const dateStr = fmtDate(order.createdAt);
  const pickupStr = fmtDateTime(order.estimatedPickupTime);

  const itemsHtml = order.items
    .map(
      (item, idx) => `
      <tr style="border-bottom: 1px solid #f1f5f9; ${idx % 2 === 1 ? 'background-color: #f8fafc;' : ''}">
        <td style="padding: 12px 16px; font-weight: 600; color: #1e293b;">${item.service.serviceName}</td>
        <td style="padding: 12px 16px; text-align: center; color: #475569;">${item.quantity}</td>
        <td style="padding: 12px 16px; text-align: right; color: #475569;">৳${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 12px 16px; text-align: right; font-weight: 700; color: #0f172a;">৳${item.totalPrice.toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  const isPaid = order.paymentStatus.toUpperCase() === "PAID";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice_${order.orderNumber}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #0f172a;
          background-color: #ffffff;
          padding: 40px;
          line-height: 1.5;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px dashed #e2e8f0;
          padding-bottom: 24px;
          margin-bottom: 32px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 900;
          font-size: 20px;
        }

        .brand-title {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
        }

        .brand-sub {
          font-size: 11px;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .invoice-badge {
          text-align: right;
        }

        .invoice-title {
          font-size: 20px;
          font-weight: 800;
          color: #2563eb;
          letter-spacing: -0.3px;
        }

        .invoice-number {
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          margin-top: 4px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 32px;
        }

        .info-card {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 20px;
        }

        .info-card h4 {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #64748b;
          margin-bottom: 12px;
        }

        .info-card p {
          font-size: 13px;
          color: #334155;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .info-card strong {
          color: #0f172a;
          font-weight: 700;
        }

        .status-pill {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-paid {
          background: #dcfce7;
          color: #15803d;
        }

        .status-unpaid {
          background: #ffe4e6;
          color: #be123c;
        }

        .table-container {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 32px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        th {
          background: #f8fafc;
          padding: 12px 16px;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.8px;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
        }

        .summary-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 40px;
        }

        .summary-box {
          width: 320px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #475569;
          margin-bottom: 10px;
        }

        .summary-row.total {
          border-top: 2px solid #e2e8f0;
          padding-top: 12px;
          margin-top: 12px;
          margin-bottom: 0;
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }

        .summary-row.total .total-amount {
          color: #2563eb;
        }

        .footer {
          text-align: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 24px;
          color: #64748b;
          font-size: 12px;
        }

        .footer p {
          margin-bottom: 4px;
        }

        @media print {
          body {
            padding: 0;
            background: none;
          }
          .invoice-container {
            border: none;
            box-shadow: none;
            padding: 20px;
            max-width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        
        <!-- Header -->
        <div class="header">
          <div class="brand">
            <div class="brand-icon">L</div>
            <div>
              <div class="brand-title">Laundrix</div>
              <div class="brand-sub">Premium Laundry & Dry Cleaning</div>
            </div>
          </div>
          <div class="invoice-badge">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">#${order.orderNumber}</div>
            <div style="margin-top: 8px;">
              <span class="status-pill ${isPaid ? 'status-paid' : 'status-unpaid'}">
                ${isPaid ? 'PAID' : 'UNPAID'}
              </span>
            </div>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="details-grid">
          <div class="info-card">
            <h4>Billed To</h4>
            <p><strong>Name:</strong> ${customerName || 'Customer'}</p>
            ${customerPhone ? `<p><strong>Phone:</strong> ${customerPhone}</p>` : ''}
            ${customerEmail ? `<p><strong>Email:</strong> ${customerEmail}</p>` : ''}
            <p style="margin-top: 6px;"><strong>Delivery Address:</strong> Linked to profile</p>
          </div>
          <div class="info-card">
            <h4>Order Metadata</h4>
            <p><strong>Order Date:</strong> ${dateStr}</p>
            <p><strong>Est. Pickup:</strong> ${pickupStr}</p>
            <p><strong>Total Garments:</strong> ${order.totalGarments} items</p>
            <p><strong>Order Status:</strong> ${order.orderStatus.replace('_', ' ')}</p>
          </div>
        </div>

        <!-- Items Table -->
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Service Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <!-- Summary Box -->
        <div class="summary-section">
          <div class="summary-box">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>৳${order.subtotal.toFixed(2)}</span>
            </div>
            ${
              order.discount > 0
                ? `<div class="summary-row" style="color: #16a34a;">
                    <span>Discount</span>
                    <span>-৳${order.discount.toFixed(2)}</span>
                  </div>`
                : ''
            }
            <div class="summary-row">
              <span>Delivery Fee</span>
              <span>${order.deliveryCharge === 0 ? 'FREE' : `৳${order.deliveryCharge.toFixed(2)}`}</span>
            </div>
            <div class="summary-row">
              <span>VAT / Service Tax (5%)</span>
              <span>৳${order.tax.toFixed(2)}</span>
            </div>
            <div class="summary-row total">
              <span>Grand Total</span>
              <span class="total-amount">৳${order.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><strong>Thank you for choosing Laundrix Services!</strong></p>
          <p>For support or queries, contact support@laundrix.app or call 09600-000000</p>
          <p style="font-size: 10px; color: #94a3b8; margin-top: 8px;">Computer-generated tax invoice. No signature required.</p>
        </div>

      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;
}

export function downloadInvoice(order: OrderRecord, customerName?: string, customerPhone?: string, customerEmail?: string) {
  const htmlContent = generateInvoiceHtml(order, customerName, customerPhone, customerEmail);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
