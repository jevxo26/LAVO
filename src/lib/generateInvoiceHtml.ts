import { OrderRecord, fmtDate, fmtDateTime } from "@/components/dashboard/(customer)/orders/types";

function getInvoiceBodyHtml(order: OrderRecord, customerName?: string, customerPhone?: string, customerEmail?: string): string {
  const dateStr = fmtDate(order.createdAt);
  const pickupStr = fmtDateTime(order.estimatedPickupTime);

  const itemsHtml = order.items
    .map(
      (item, idx) => `
      <tr style="border-bottom: 1px solid #f1f5f9; ${idx % 2 === 1 ? 'background-color: #f8fafc;' : ''}">
        <td style="padding: 10px 14px; font-weight: 600; color: #1e293b;">${item.service.serviceName}</td>
        <td style="padding: 10px 14px; text-align: center; color: #475569;">${item.quantity}</td>
        <td style="padding: 10px 14px; text-align: right; color: #475569;">৳${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 10px 14px; text-align: right; font-weight: 700; color: #0f172a;">৳${item.totalPrice.toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  const isPaid = order.paymentStatus.toUpperCase() === "PAID";

  return `
    <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; color: #0f172a; background-color: #ffffff; padding: 12px; line-height: 1.4; box-sizing: border-box; width: 700px; margin: 0 auto;">
      <div style="border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; background: #ffffff;">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px dashed #e2e8f0; padding-bottom: 16px; margin-bottom: 18px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 16px;">
              L
            </div>
            <div>
              <div style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">Laundrix</div>
              <div style="font-size: 9px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">Premium Laundry & Dry Cleaning</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 16px; font-weight: 800; color: #2563eb; letter-spacing: -0.3px;">INVOICE</div>
            <div style="font-size: 11px; font-weight: 700; color: #475569; margin-top: 1px;">#${order.orderNumber}</div>
            <div style="margin-top: 4px;">
              <span style="display: inline-block; padding: 3px 9px; border-radius: 16px; font-size: 9px; font-weight: 800; text-transform: uppercase; ${isPaid ? 'background: #dcfce7; color: #15803d;' : 'background: #ffe4e6; color: #be123c;'}">
                ${isPaid ? 'PAID' : 'UNPAID'}
              </span>
            </div>
          </div>
        </div>

        <!-- Details Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 18px;">
          <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 12px;">
            <h4 style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-bottom: 6px;">Billed To</h4>
            <p style="font-size: 11px; color: #334155; margin-bottom: 3px;"><strong>Name:</strong> ${customerName || 'Customer'}</p>
            ${customerPhone ? `<p style="font-size: 11px; color: #334155; margin-bottom: 3px;"><strong>Phone:</strong> ${customerPhone}</p>` : ''}
            ${customerEmail ? `<p style="font-size: 11px; color: #334155; margin-bottom: 3px;"><strong>Email:</strong> ${customerEmail}</p>` : ''}
            <p style="font-size: 11px; color: #334155; margin-top: 3px;"><strong>Delivery Address:</strong> Linked to profile</p>
          </div>
          <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 12px;">
            <h4 style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-bottom: 6px;">Order Details</h4>
            <p style="font-size: 11px; color: #334155; margin-bottom: 3px;"><strong>Order Date:</strong> ${dateStr}</p>
            <p style="font-size: 11px; color: #334155; margin-bottom: 3px;"><strong>Est. Pickup:</strong> ${pickupStr}</p>
            <p style="font-size: 11px; color: #334155; margin-bottom: 3px;"><strong>Total Garments:</strong> ${order.totalGarments} items</p>
            <p style="font-size: 11px; color: #334155;"><strong>Order Status:</strong> ${order.orderStatus.replace('_', ' ')}</p>
          </div>
        </div>

        <!-- Items Table -->
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 18px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <th style="padding: 8px 12px; text-align: left; font-weight: 700; text-transform: uppercase; font-size: 8.5px; color: #475569;">Service Description</th>
                <th style="padding: 8px 12px; text-align: center; font-weight: 700; text-transform: uppercase; font-size: 8.5px; color: #475569;">Qty</th>
                <th style="padding: 8px 12px; text-align: right; font-weight: 700; text-transform: uppercase; font-size: 8.5px; color: #475569;">Unit Price</th>
                <th style="padding: 8px 12px; text-align: right; font-weight: 700; text-transform: uppercase; font-size: 8.5px; color: #475569;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <!-- Summary Box -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
          <div style="width: 270px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #475569; margin-bottom: 6px;">
              <span>Subtotal</span>
              <span>৳${order.subtotal.toFixed(2)}</span>
            </div>
            ${
              order.discount > 0
                ? `<div style="display: flex; justify-content: space-between; font-size: 11px; color: #16a34a; margin-bottom: 6px;">
                    <span>Discount</span>
                    <span>-৳${order.discount.toFixed(2)}</span>
                  </div>`
                : ''
            }
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #475569; margin-bottom: 6px;">
              <span>Delivery Fee</span>
              <span>${order.deliveryCharge === 0 ? 'FREE' : `৳${order.deliveryCharge.toFixed(2)}`}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #475569; margin-bottom: 6px;">
              <span>VAT / Service Tax (5%)</span>
              <span>৳${order.tax.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 2px solid #e2e8f0; padding-top: 8px; font-size: 14px; font-weight: 800; color: #0f172a;">
              <span>Grand Total</span>
              <span style="color: #2563eb;">৳${order.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; color: #64748b; font-size: 10px;">
          <p style="margin-bottom: 2px;"><strong>Thank you for choosing Laundrix Services!</strong></p>
          <p>For support or queries, contact support@laundrix.app or call 09600-000000</p>
        </div>

      </div>
    </div>
  `;
}

export async function downloadInvoice(
  order: OrderRecord,
  customerName?: string,
  customerPhone?: string,
  customerEmail?: string
) {
  if (typeof window === "undefined") return;

  const loadHtml2Pdf = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).html2pdf) {
        resolve((window as any).html2pdf);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = () => resolve((window as any).html2pdf);
      script.onerror = () => reject(new Error("Failed to load PDF engine"));
      document.head.appendChild(script);
    });
  };

  try {
    const html2pdf = await loadHtml2Pdf();

    // Create a temporary container
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.style.width = "720px";
    container.style.background = "#ffffff";

    container.innerHTML = getInvoiceBodyHtml(order, customerName, customerPhone, customerEmail);
    document.body.appendChild(container);

    const opt = {
      margin: 0,
      filename: `Invoice_${order.orderNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    await html2pdf().set(opt).from(container).save();

    document.body.removeChild(container);
  } catch (err) {
    console.error("PDF direct download failed, fallback to print:", err);
    // Fallback: open print window
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head><title>Invoice_${order.orderNumber}</title></head>
        <body>
          ${getInvoiceBodyHtml(order, customerName, customerPhone, customerEmail)}
          <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  }
}
