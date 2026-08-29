import { jsPDF } from 'jspdf';
import { ChatMessage, UserHardwareSpecs } from '../types';

export function exportChatResolutionToPdf(
  messages: ChatMessage[],
  userSpecs: UserHardwareSpecs,
  specificMessageId?: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - margin - 10) {
      doc.addPage();
      y = margin;
      drawPageHeader();
    }
  };

  const drawPageHeader = () => {
    // Top banner background
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, contentWidth, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(34, 197, 94); // neon green
    doc.text('GAMEFIX AI', margin + 3, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('OFFLINE CRASH RECOVERY & RESOLUTION RUNBOOK', margin + 30, y + 5.5);

    doc.text(
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      pageWidth - margin - 3,
      y + 5.5,
      { align: 'right' }
    );

    y += 12;
  };

  // --- Document Cover / Header ---
  // Header background card
  doc.setFillColor(12, 12, 14);
  doc.roundedRect(margin, y, contentWidth, 32, 2, 2, 'F');
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 32, 2, 2, 'S');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('GameFix AI Diagnostic Runbook', margin + 6, y + 8);

  // Subtitle
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Offline Step-by-Step Troubleshooting Guide & Command Sheet', margin + 6, y + 14);

  // Hardware Specs strip inside header
  doc.setFillColor(24, 24, 27);
  doc.rect(margin + 4, y + 18, contentWidth - 8, 10, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 197, 94);
  doc.text('HARDWARE CONFIG:', margin + 6, y + 24.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  const specsText = `${userSpecs.gpu} | ${userSpecs.cpu} | ${userSpecs.ram} | ${userSpecs.os}`;
  doc.text(specsText.length > 70 ? specsText.substring(0, 68) + '...' : specsText, margin + 42, y + 24.5);

  y += 38;

  // Filter messages
  let targetMessages = messages.filter((m) => m.content.trim().length > 0);
  if (specificMessageId) {
    const single = messages.find((m) => m.id === specificMessageId);
    if (single) {
      // also include preceding user prompt if available
      const idx = messages.findIndex((m) => m.id === specificMessageId);
      if (idx > 0 && messages[idx - 1].role === 'user') {
        targetMessages = [messages[idx - 1], single];
      } else {
        targetMessages = [single];
      }
    }
  }

  // If no diagnostic messages found
  if (targetMessages.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('No active diagnostic sessions found to export.', margin, y);
    doc.save('GameFix_Resolution_Guide.pdf');
    return;
  }

  // Iterate over messages
  targetMessages.forEach((msg, mIdx) => {
    addNewPageIfNeeded(25);

    if (msg.role === 'user') {
      // User Query Box
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(56, 189, 248); // sky-400
      doc.text('REPORTED ISSUE / INQUIRY:', margin + 4, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(248, 250, 252);
      const cleanUserText = msg.content.replace(/^\[SPECS:[^\]]+\]\s*/i, '');
      const wrappedUser = doc.splitTextToSize(cleanUserText, contentWidth - 8);
      doc.text(wrappedUser[0] || cleanUserText, margin + 4, y + 9.5);

      y += 16;
    } else {
      // Assistant Diagnosis & Action Plan
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(34, 197, 94);
      doc.text(`DIAGNOSTIC RESOLUTION PLAN #${mIdx + 1}`, margin, y);
      y += 6;

      if (msg.parsed) {
        const parsed = msg.parsed;

        // 1. Root Cause
        if (parsed.quickCause) {
          addNewPageIfNeeded(20);
          doc.setFillColor(254, 242, 242);
          doc.setDrawColor(239, 68, 68);
          doc.setLineWidth(0.3);
          doc.roundedRect(margin, y, contentWidth, 14, 1, 1, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(185, 28, 28);
          doc.text('ROOT CAUSE IDENTIFIED:', margin + 3, y + 4.5);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(69, 10, 10);
          const causeLines = doc.splitTextToSize(parsed.quickCause, contentWidth - 6);
          doc.text(causeLines, margin + 3, y + 9);

          y += 18;
        }

        // 2. Steps
        if (parsed.steps && parsed.steps.length > 0) {
          addNewPageIfNeeded(15);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(15, 23, 42);
          doc.text('STEP-BY-STEP FIX INSTRUCTIONS:', margin, y);
          y += 5;

          parsed.steps.forEach((step, sIdx) => {
            addNewPageIfNeeded(25);

            // Step title
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(30, 41, 59);
            doc.text(`${sIdx + 1}. ${step.title}`, margin + 2, y);
            y += 4.5;

            // Step detail
            if (step.detail) {
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(8.5);
              doc.setTextColor(71, 85, 105);
              const detailLines = doc.splitTextToSize(step.detail, contentWidth - 6);
              doc.text(detailLines, margin + 4, y);
              y += detailLines.length * 4 + 2;
            }

            // Command snippet if present
            if (step.command) {
              addNewPageIfNeeded(16);
              const cmdLines = doc.splitTextToSize(step.command, contentWidth - 10);
              const boxHeight = Math.max(8, cmdLines.length * 4 + 4);

              doc.setFillColor(24, 24, 27);
              doc.roundedRect(margin + 4, y, contentWidth - 8, boxHeight, 1, 1, 'F');

              doc.setFont('courier', 'bold');
              doc.setFontSize(8);
              doc.setTextColor(34, 197, 94);
              doc.text(cmdLines, margin + 7, y + 5);

              y += boxHeight + 4;
            }
          });
        }

        // 3. Pro-Tip
        if (parsed.proTip) {
          addNewPageIfNeeded(18);
          doc.setFillColor(240, 253, 244);
          doc.setDrawColor(34, 197, 94);
          doc.setLineWidth(0.3);
          doc.roundedRect(margin, y, contentWidth, 14, 1, 1, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(21, 128, 61);
          doc.text('GAMEFIX PRO-TIP (MAX FPS / ZERO STUTTER):', margin + 3, y + 4.5);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(20, 83, 45);
          const tipLines = doc.splitTextToSize(parsed.proTip, contentWidth - 6);
          doc.text(tipLines, margin + 3, y + 9);

          y += 18;
        }
      } else {
        // Fallback for unstructured text response
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        const textLines = doc.splitTextToSize(msg.content, contentWidth - 4);
        doc.text(textLines, margin + 2, y);
        y += textLines.length * 4 + 6;
      }
    }
  });

  // --- Offline Emergency Commands Reference Box at End ---
  addNewPageIfNeeded(35);
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, contentWidth, 30, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(56, 189, 248);
  doc.text('OFFLINE EMERGENCY RECOVERY CHEAT-SHEET (RUN IN ADMIN CMD):', margin + 4, y + 5);

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);
  doc.text('1. System File Check:      sfc /scannow', margin + 4, y + 11);
  doc.text('2. Windows Image Repair:   DISM /Online /Cleanup-Image /RestoreHealth', margin + 4, y + 16);
  doc.text('3. Network Reset & DNS:    ipconfig /flushdns && netsh winsock reset', margin + 4, y + 21);
  doc.text('4. Graphics Driver Reset:  Press Win + Ctrl + Shift + B during black screen', margin + 4, y + 26);

  y += 36;

  // --- Page Numbering on all pages ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `GameFix AI • Offline Resolution Runbook • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  // Save the PDF directly to downloads
  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save(`GameFix_Resolution_Guide_${timestamp}.pdf`);
}
