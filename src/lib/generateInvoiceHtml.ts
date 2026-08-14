import { OrderRecord, fmtDate, fmtDateTime } from "@/components/dashboard/(customer)/orders/types";

function getInvoiceBodyHtml(order: OrderRecord, customerName?: string, customerPhone?: string, customerEmail?: string): string {
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
    <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; color: #0f172a; background-color: #ffffff; padding: 16px; line-height: 1.4; box-sizing: border-box; width: 750px; margin: 0 auto;">
      <div style="border: 1px solid #e2e8f0; border-radius: 20px; padding: 22px 28px; background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px dashed #e2e8f0; padding-bottom: 16px; margin-bottom: 20px;">
          
          <!-- Logo & Brand -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #0284c7, #2563eb); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"/>
              </svg>
            </div>
            <div>
              <div style="font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; line-height: 1.1;">Laundrix</div>
              <div style="font-size: 9.5px; color: #0284c7; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 2px;">Premium Laundry & Dry Cleaning</div>
            </div>
          </div>

          <!-- Invoice Title & Clean Payment Badge -->
          <div style="text-align: right;">
            <div style="font-size: 20px; font-weight: 900; color: #1e293b; letter-spacing: 0.5px; line-height: 1.1;">INVOICE</div>
            <div style="font-size: 12px; font-weight: 700; color: #64748b; margin-top: 1px;">#${order.orderNumber}</div>
            <div style="margin-top: 4px; text-align: right;">
              <span style="display: inline-block; padding: 2px 10px; border-radius: 16px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; ${
                isPaid
                  ? 'background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;'
                  : 'background: #ffe4e6; color: #be123c; border: 1px solid #fecdd3;'
              }">
                ${isPaid ? 'PAID' : 'UNPAID'}
              </span>
            </div>
          </div>

        </div>

        <!-- Details Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px;">
          <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; padding: 18px;">
            <h4 style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-bottom: 10px;">Billed To</h4>
            <p style="font-size: 13px; color: #334155; margin-bottom: 4px;"><strong>Name:</strong> ${customerName || 'Customer'}</p>
            ${customerPhone ? `<p style="font-size: 13px; color: #334155; margin-bottom: 4px;"><strong>Phone:</strong> ${customerPhone}</p>` : ''}
            ${customerEmail ? `<p style="font-size: 13px; color: #334155; margin-bottom: 4px;"><strong>Email:</strong> ${customerEmail}</p>` : ''}
            <p style="font-size: 13px; color: #334155; margin-top: 4px;"><strong>Delivery Address:</strong> Linked to profile</p>
          </div>
          <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; padding: 18px;">
            <h4 style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-bottom: 10px;">Order Details</h4>
            <p style="font-size: 13px; color: #334155; margin-bottom: 4px;"><strong>Order Date:</strong> ${dateStr}</p>
            <p style="font-size: 13px; color: #334155; margin-bottom: 4px;"><strong>Est. Pickup:</strong> ${pickupStr}</p>
            <p style="font-size: 13px; color: #334155; margin-bottom: 4px;"><strong>Total Garments:</strong> ${order.totalGarments} items</p>
            <p style="font-size: 13px; color: #334155;"><strong>Order Status:</strong> ${order.orderStatus.replace('_', ' ')}</p>
          </div>
        </div>

        <!-- Items Table -->
        <div style="border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 28px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <th style="padding: 12px 16px; text-align: left; font-weight: 700; text-transform: uppercase; font-size: 10px; color: #475569;">Service Description</th>
                <th style="padding: 12px 16px; text-align: center; font-weight: 700; text-transform: uppercase; font-size: 10px; color: #475569;">Qty</th>
                <th style="padding: 12px 16px; text-align: right; font-weight: 700; text-transform: uppercase; font-size: 10px; color: #475569;">Unit Price</th>
                <th style="padding: 12px 16px; text-align: right; font-weight: 700; text-transform: uppercase; font-size: 10px; color: #475569;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <!-- Summary Box -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 32px;">
          <div style="width: 320px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px;">
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #475569; margin-bottom: 10px;">
              <span>Subtotal</span>
              <span>৳${order.subtotal.toFixed(2)}</span>
            </div>
            ${
              order.discount > 0
                ? `<div style="display: flex; justify-content: space-between; font-size: 13px; color: #16a34a; margin-bottom: 10px;">
                    <span>Discount</span>
                    <span>-৳${order.discount.toFixed(2)}</span>
                  </div>`
                : ''
            }
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #475569; margin-bottom: 10px;">
              <span>Delivery Fee</span>
              <span>${order.deliveryCharge === 0 ? 'FREE' : `৳${order.deliveryCharge.toFixed(2)}`}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #475569; margin-bottom: 10px;">
              <span>VAT / Service Tax (5%)</span>
              <span>৳${order.tax.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 2px solid #e2e8f0; padding-top: 12px; font-size: 16px; font-weight: 900; color: #0f172a;">
              <span>Grand Total</span>
              <span style="color: #2563eb;">৳${order.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; color: #64748b; font-size: 12px;">
          <p style="margin-bottom: 4px;"><strong>Thank you for choosing Laundrix Services!</strong></p>
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

  const loadHtml2Canvas = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).html2canvas) {
        resolve((window as any).html2canvas);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      script.onload = () => resolve((window as any).html2canvas);
      script.onerror = () => reject(new Error("Failed to load image engine"));
      document.head.appendChild(script);
    });
  };

  try {
    const html2canvas = await loadHtml2Canvas();

    // Create a temporary container for snapshot
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.style.width = "750px";
    container.style.background = "#ffffff";

    container.innerHTML = getInvoiceBodyHtml(order, customerName, customerPhone, customerEmail);
    document.body.appendChild(container);

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    document.body.removeChild(container);

    // Convert canvas to PNG image data URL and trigger download
    const imgData = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imgData;
    link.download = `Invoice_${order.orderNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("PNG download failed:", err);
  }
}
