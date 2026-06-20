// jsPDF challan generation — runs entirely in browser
import { jsPDF } from "jspdf";

export default function PDFExport({ challan }) {
  const handleDownload = () => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    let y = 20;

    // header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("VioLens", 14, y);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("AI-Powered Traffic Violation Detection", 14, y + 7);

    // e-Challan title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("e-Challan", pageW / 2, y, { align: "center" });

    // challan ID
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`ID: ${challan.challan_id}`, pageW - 14, y, { align: "right" });
    doc.text(`Date: ${new Date(challan.timestamp).toLocaleString()}`, pageW - 14, y + 5, { align: "right" });
    doc.text(`Camera: ${challan.camera_id}`, pageW - 14, y + 10, { align: "right" });

    y += 25;
    doc.setDrawColor(100);
    doc.line(14, y, pageW - 14, y);
    y += 10;

    // vehicle details section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Vehicle Details", 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const vehicleRows = [
      ["Vehicle Class", challan.vehicle.class],
      ["License Plate", challan.vehicle.plate?.raw || "Not detected"],
      ["State", challan.vehicle.plate?.state || challan.state_name],
      ["Jurisdiction", `${challan.state_name} (${challan.state})`],
      ["Fine Multiplier", `×${challan.multiplier}`]
    ];

    vehicleRows.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, 70, y);
      y += 6;
    });

    y += 5;

    // violations table header
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Violations", 14, y);
    y += 8;

    // table headers
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(30, 30, 50);
    doc.setTextColor(255);
    doc.rect(14, y - 4, pageW - 28, 7, "F");
    doc.text("Violation", 16, y);
    doc.text("Section", 90, y);
    doc.text("Confidence", 125, y);
    doc.text("Fine (₹)", 165, y);
    y += 8;

    // table rows
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    challan.violations.forEach((v, i) => {
      // alternating row background
      if (i % 2 === 0) {
        doc.setFillColor(245, 245, 250);
        doc.rect(14, y - 4, pageW - 28, 7, "F");
      }
      doc.text(v.label, 16, y);
      doc.text(v.section, 90, y);
      doc.text(`${Math.round(v.confidence * 100)}%`, 125, y);
      doc.text(`₹${v.adjusted_fine.toLocaleString("en-IN")}`, 165, y);
      y += 7;
    });

    y += 5;
    doc.line(14, y, pageW - 14, y);
    y += 10;

    // total fine
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Total Fine:", 14, y);
    doc.setTextColor(220, 38, 38);
    doc.text(`₹${challan.total_fine.toLocaleString("en-IN")}`, pageW - 14, y, { align: "right" });

    y += 15;
    doc.setTextColor(0);

    // evidence image if available
    if (challan.evidence_image) {
      try {
        const imgW = pageW - 28;
        const imgH = imgW * 0.6;
        // check if we need a new page
        if (y + imgH > doc.internal.pageSize.getHeight() - 30) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Evidence Image", 14, y);
        y += 5;
        doc.addImage(challan.evidence_image, "PNG", 14, y, imgW, imgH);
        y += imgH + 10;
      } catch (e) {
        // skip image embed on error
        console.warn("Could not embed evidence image:", e);
      }
    }

    // footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(128);
    doc.text("Generated under MV Act 2019 | VioLens AI Traffic System | For demonstration purposes only", pageW / 2, footerY, { align: "center" });

    // save PDF
    const plate = challan.vehicle.plate?.raw?.replace(/\s+/g, "_") || "UNKNOWN";
    const ts = new Date().toISOString().slice(0, 10);
    doc.save(`CHALLAN_${plate}_${ts}.pdf`);
  };

  return (
    <button
      className="pdf-export-btn"
      onClick={handleDownload}
      id={`pdf-${challan.challan_id.slice(0, 8)}`}
    >
      📄 Download Challan PDF
    </button>
  );
}
