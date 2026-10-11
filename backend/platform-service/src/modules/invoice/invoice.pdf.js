import PDFDocument from "pdfkit";

/**
 * Generates a professional invoice PDF buffer using PDFKit.
 * @param {Object} invoice - Invoice document
 * @param {Object} project - Populated project document
 * @param {Object} vendor - Populated vendor document
 * @returns {Promise<Buffer>}
 */
export const generateInvoicePdf = async (invoice, project = {}, vendor = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Header Branding
      doc
        .fillColor("#4F46E5")
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("FieldCam", 40, 40);
      doc
        .fillColor("#6B7280")
        .fontSize(9)
        .font("Helvetica")
        .text("Field Operations Platform — Official Invoice", 40, 68);

      // Invoice Top Right Header
      doc
        .fillColor("#111827")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("INVOICE", 380, 40, { align: "right" });
      doc
        .fillColor("#4F46E5")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(invoice.invoiceId, 380, 60, { align: "right" });
      doc
        .fillColor("#6B7280")
        .fontSize(9)
        .font("Helvetica")
        .text(`Status: ${invoice.status}`, 380, 75, { align: "right" });

      // Divider Line
      doc
        .strokeColor("#E5E7EB")
        .lineWidth(1)
        .moveTo(40, 95)
        .lineTo(555, 95)
        .stroke();

      // Dates & Vendor / Client Info Box
      const dateY = 110;
      doc
        .fillColor("#374151")
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("Invoice Date:", 40, dateY);
      doc
        .font("Helvetica")
        .text(
          invoice.invoiceDate
            ? new Date(invoice.invoiceDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—",
          110,
          dateY
        );

      doc
        .font("Helvetica-Bold")
        .text("Due Date:", 40, dateY + 16);
      doc
        .font("Helvetica")
        .text(
          invoice.dueDate
            ? new Date(invoice.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—",
          110,
          dateY + 16
        );

      // Billed By (Vendor)
      doc
        .font("Helvetica-Bold")
        .fillColor("#111827")
        .fontSize(10)
        .text("Billed By (Vendor):", 240, dateY);
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#4B5563")
        .text(invoice.vendorName || vendor.companyName || "Vendor", 240, dateY + 14)
        .text(vendor.contactName ? `Contact: ${vendor.contactName}` : "", 240, dateY + 26)
        .text(vendor.location || "", 240, dateY + 38);

      // Project & Client Info
      doc
        .font("Helvetica-Bold")
        .fillColor("#111827")
        .fontSize(10)
        .text("Project / Work Order:", 400, dateY);
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#4B5563")
        .text(invoice.projectTitle || project.projectName || "Project", 400, dateY + 14)
        .text(`Code: ${project.projectId || "—"}`, 400, dateY + 26)
        .text(`Client: ${project.client || "—"}`, 400, dateY + 38);

      // Line Items Table Header
      const tableTop = 180;
      doc
        .rect(40, tableTop, 515, 22)
        .fill("#F3F4F6");

      doc
        .fillColor("#374151")
        .fontSize(9)
        .font("Helvetica-Bold");
      doc.text("Description", 50, tableTop + 6);
      doc.text("Qty", 340, tableTop + 6, { width: 40, align: "right" });
      doc.text("Rate ($)", 400, tableTop + 6, { width: 60, align: "right" });
      doc.text("Amount ($)", 480, tableTop + 6, { width: 65, align: "right" });

      let currentY = tableTop + 26;
      doc.font("Helvetica").fontSize(9).fillColor("#1F2937");

      const items = Array.isArray(invoice.items) && invoice.items.length > 0
        ? invoice.items
        : [
            {
              description: invoice.projectTitle || "Project Services",
              quantity: 1,
              rate: invoice.amount || invoice.subtotal || 0,
              amount: invoice.amount || invoice.subtotal || 0,
            },
          ];

      items.forEach((item, index) => {
        // Alternating row background
        if (index % 2 === 1) {
          doc.rect(40, currentY - 2, 515, 20).fill("#F9FAFB");
        }

        doc.fillColor("#1F2937");
        doc.text(item.description, 50, currentY, { width: 280, ellipsis: true });
        doc.text(Number(item.quantity).toString(), 340, currentY, { width: 40, align: "right" });
        doc.text(Number(item.rate).toFixed(2), 400, currentY, { width: 60, align: "right" });
        doc.text(Number(item.amount).toFixed(2), 480, currentY, { width: 65, align: "right" });

        currentY += 22;
      });

      // Bottom border for table
      doc.strokeColor("#E5E7EB").lineWidth(1).moveTo(40, currentY).lineTo(555, currentY).stroke();
      currentY += 12;

      // Totals Box
      const totalsX = 350;
      doc.fontSize(9).font("Helvetica-Bold").fillColor("#4B5563");
      doc.text("Subtotal:", totalsX, currentY);
      doc.font("Helvetica").text(`$${Number(invoice.subtotal || invoice.amount || 0).toFixed(2)}`, 480, currentY, { align: "right" });

      currentY += 16;
      doc.font("Helvetica-Bold").text("Tax (0%):", totalsX, currentY);
      doc.font("Helvetica").text("$0.00", 480, currentY, { align: "right" });

      currentY += 16;
      doc.strokeColor("#E5E7EB").lineWidth(1).moveTo(totalsX, currentY).lineTo(555, currentY).stroke();
      currentY += 6;

      doc.fontSize(11).font("Helvetica-Bold").fillColor("#111827");
      doc.text("Total Due:", totalsX, currentY);
      doc.fillColor("#4F46E5").text(`$${Number(invoice.totalAmount || invoice.amount || 0).toFixed(2)}`, 480, currentY, { align: "right" });

      // Payment Details (if Paid)
      if (invoice.status === "Paid") {
        currentY += 30;
        doc.rect(40, currentY, 515, 45).fill("#ECFDF5");
        doc.strokeColor("#A7F3D0").lineWidth(1).rect(40, currentY, 515, 45).stroke();

        doc.fillColor("#065F46").fontSize(10).font("Helvetica-Bold").text("Payment Recorded", 50, currentY + 8);
        doc.fontSize(8).font("Helvetica").fillColor("#047857");
        doc.text(
          `Paid on: ${invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}`,
          50,
          currentY + 22
        );
        doc.text(`Method: ${invoice.paymentMethod || "Direct Transfer"}`, 220, currentY + 22);
        if (invoice.paymentNotes) {
          doc.text(`Notes: ${invoice.paymentNotes}`, 360, currentY + 22);
        }
      }

      // Notes & Terms Footer
      if (invoice.notes) {
        currentY = Math.max(currentY + 60, doc.page.height - 120);
        doc.fontSize(9).font("Helvetica-Bold").fillColor("#374151").text("Notes / Remarks:", 40, currentY);
        doc.fontSize(8).font("Helvetica").fillColor("#6B7280").text(invoice.notes, 40, currentY + 12, { width: 515 });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
