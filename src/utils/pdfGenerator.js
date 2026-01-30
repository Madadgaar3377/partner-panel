import jsPDF from 'jspdf';

// Import jspdf-autotable - it should extend jsPDF automatically
// Using both import styles to ensure it loads
import 'jspdf-autotable';

/**
 * Helper to create a simple table manually if autoTable is not available
 */
const createSimpleTable = (doc, data, startX, startY, colWidths, headStyles = {}, bodyStyles = {}) => {
  const baseRowHeight = 8;
  const fontSize = 10; // Standard font size
  const lineSpacing = 4.5;
  const cellPadding = 3; // Standard padding
  let currentY = startY;
  
  // Draw header
  if (data.length > 0 && Array.isArray(data[0])) {
    const header = data[0];
    let currentX = startX;
    let headerHeight = baseRowHeight;
    
    // Calculate header height based on text wrapping
    header.forEach((cell, i) => {
      const width = colWidths[i] || 50;
      const maxWidth = width - (cellPadding * 2);
      const lines = doc.splitTextToSize(String(cell), maxWidth);
      headerHeight = Math.max(headerHeight, lines.length * lineSpacing + 4);
    });
    
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    
    header.forEach((cell, i) => {
      const width = colWidths[i] || 50;
      doc.setFillColor(229, 57, 53);
      doc.rect(currentX, currentY, width, headerHeight, 'F');
      
      if (i === 0) {
        // Field column header - no wrapping, truncate if needed
        const maxWidth = width - (cellPadding * 2);
        const cellText = String(cell);
        const textWidth = doc.getTextWidth(cellText);
        if (textWidth > maxWidth) {
          let truncated = cellText;
          while (doc.getTextWidth(truncated + '...') > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
          }
          const truncatedText = truncated + '...';
          const truncatedWidth = doc.getTextWidth(truncatedText);
          doc.text(truncatedText, currentX + (width - truncatedWidth) / 2, currentY + 5);
        } else {
          doc.text(cellText, currentX + (width - textWidth) / 2, currentY + 5);
        }
      } else {
        // Value column header - allow wrapping
        const maxWidth = width - (cellPadding * 2);
        const lines = doc.splitTextToSize(String(cell), maxWidth);
        lines.forEach((line, lineIdx) => {
          const textWidth = doc.getTextWidth(line);
          doc.text(line, currentX + (width - textWidth) / 2, currentY + 5 + (lineIdx * lineSpacing));
        });
      }
      
      currentX += width;
    });
    
    currentY += headerHeight;
    
    // Draw body
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
      const row = data[rowIdx];
      let rowX = startX;
      const rowY = currentY;
      let maxRowHeight = baseRowHeight;
      
      // First pass: calculate max height needed for this row
      row.forEach((cell, i) => {
        const width = colWidths[i] || 50;
        const cellText = String(cell || '');
        const maxWidth = width - (cellPadding * 2);
        const lines = doc.splitTextToSize(cellText, maxWidth);
        const cellHeight = Math.max(baseRowHeight, lines.length * lineSpacing + 4);
        maxRowHeight = Math.max(maxRowHeight, cellHeight);
      });
      
      // Second pass: draw cells with consistent height
      row.forEach((cell, i) => {
        const width = colWidths[i] || 50;
        const cellText = String(cell || '');
        
        doc.setFillColor(255, 255, 255);
        doc.rect(rowX, rowY, width, maxRowHeight, 'FD');
        
        if (i === 0) {
          // Field column - NO wrapping, truncate if too long
          const maxWidth = width - (cellPadding * 2);
          const textWidth = doc.getTextWidth(cellText);
          if (textWidth > maxWidth) {
            // Truncate text with ellipsis
            let truncated = cellText;
            while (doc.getTextWidth(truncated + '...') > maxWidth && truncated.length > 0) {
              truncated = truncated.slice(0, -1);
            }
            doc.text(truncated + '...', rowX + cellPadding, rowY + 5);
          } else {
            doc.text(cellText, rowX + cellPadding, rowY + 5);
          }
        } else {
          // Value column - ENABLE wrapping for long content
          const maxWidth = width - (cellPadding * 2);
          const lines = doc.splitTextToSize(cellText, maxWidth);
          lines.forEach((line, lineIdx) => {
            doc.text(line, rowX + cellPadding, rowY + 5 + (lineIdx * lineSpacing));
          });
        }
        
        rowX += width;
      });
      
      currentY += maxRowHeight;
    }
  }
  
  return currentY;
};

/**
 * Helper function to call autoTable with fallback
 */
const callAutoTable = (doc, options) => {
  // Try autoTable first (preferred method)
  if (typeof doc.autoTable === 'function') {
    return doc.autoTable(options);
  }
  
  // Check prototype
  const proto = Object.getPrototypeOf(doc);
  if (typeof proto.autoTable === 'function') {
    return proto.autoTable.call(doc, options);
  }
  
  // Fallback: create simple table manually
  console.warn('jspdf-autotable not available, using fallback table rendering');
  
  const { head = [], body = [], startY = 20, margin = { left: 14, right: 14 } } = options;
  const pageWidth = doc.internal.pageSize.getWidth();
  const availableWidth = pageWidth - margin.left - margin.right;
  const colCount = head.length || (body[0] ? body[0].length : 2);
  
  // For Field/Value tables, use fixed Field width and flexible Value width
  if (colCount === 2 && head[0] && (head[0][0] === 'Field' || head[0][0] === '#')) {
    // Field: Fixed 45mm, Value: Remaining space (flexible)
    const fieldColWidth = 45; // Fixed width in mm
    const valueColWidth = availableWidth - fieldColWidth; // Remaining space
    const colWidths = [fieldColWidth, valueColWidth];
    const tableData = head.length > 0 ? [head, ...body] : body;
    const finalY = createSimpleTable(doc, tableData, margin.left, startY, colWidths);
    doc.lastAutoTable = { finalY };
    return doc;
  }
  
  // For tables with many columns, use proportional widths
  if (colCount > 5) {
    // For wide tables, use smaller font and proportional widths
    const proportionalWidths = Array(colCount).fill(0).map((_, i) => {
      if (i === 0) return availableWidth * 0.08; // Serial number - narrow
      if (i === 1) return availableWidth * 0.15; // ID - medium
      return availableWidth * 0.77 / (colCount - 2); // Rest distributed
    });
    const tableData = head.length > 0 ? [head, ...body] : body;
    const finalY = createSimpleTable(doc, tableData, margin.left, startY, proportionalWidths);
    doc.lastAutoTable = { finalY };
    return doc;
  }
  
  // For other tables, distribute evenly but ensure minimum width
  const minColWidth = 30; // Minimum column width in mm
  const totalMinWidth = minColWidth * colCount;
  const colWidth = totalMinWidth > availableWidth 
    ? availableWidth / colCount 
    : Math.max(minColWidth, availableWidth / colCount);
  const colWidths = Array(colCount).fill(colWidth);
  
  // Combine head and body
  const tableData = head.length > 0 ? [head, ...body] : body;
  
  const finalY = createSimpleTable(doc, tableData, margin.left, startY, colWidths);
  
  // Store finalY for compatibility
  doc.lastAutoTable = { finalY };
  
  return doc;
};

/**
 * Generate PDF for a single assignment
 */
export const generateAssignmentPDF = (assignment) => {
  try {
    // Validate input
    if (!assignment) {
      console.error('Assignment data is required');
      return;
    }

    // Use A4 paper size
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace = 20) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Header with improved styling
  doc.setFillColor(229, 57, 53); // Red color
  doc.rect(0, 0, pageWidth, 45, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('MADADGAAR', pageWidth / 2, 22, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Assignment Details Report', pageWidth / 2, 32, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 40, { align: 'center' });

  yPosition = 55;
  doc.setTextColor(0, 0, 0);

  // Assignment Information with better styling
  doc.setFillColor(240, 240, 240);
  doc.rect(14, yPosition - 5, pageWidth - 28, 8, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(229, 57, 53);
  doc.text('Assignment Information', 14, yPosition);
  yPosition += 12;

  const assignmentData = assignment.assignment || {};
  const applicationData = assignment.applicationData || {};
  const applicationType = assignment.applicationType || 'unknown';

  const assignmentInfo = [
    ['Assignment ID', assignmentData._id?.toString().slice(-8) || 'N/A'],
    ['Application ID', assignmentData.applicationId || 'N/A'],
    ['Status', (assignmentData.status || 'pending').toUpperCase()],
    ['Category', assignmentData.category || 'N/A'],
    ['City', assignmentData.city || 'N/A'],
    ['Application Type', applicationType.toUpperCase()],
    ['Assigned At', formatDate(assignmentData.assigenAt)],
  ];

  callAutoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Value']],
    body: assignmentInfo,
    theme: 'grid',
    margin: { left: 14, right: 14 },
    rowPageBreak: 'avoid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
      overflow: 'linebreak',
      valign: 'top'
    },
    headStyles: {
      fillColor: [229, 57, 53],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: {
        cellWidth: 45,
        overflow: 'ellipsize',
        fontStyle: 'bold'
      },
      1: {
        cellWidth: 'auto',
        overflow: 'linebreak'
      }
    },
  });

  yPosition = (doc.lastAutoTable?.finalY || yPosition) + 15;
  checkPageBreak(30);

  // Applicant Information with better styling
  checkPageBreak(30);
  doc.setFillColor(240, 240, 240);
  doc.rect(14, yPosition - 5, pageWidth - 28, 8, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(229, 57, 53);
  doc.text('Applicant Information', 14, yPosition);
  yPosition += 12;

  const applicantName = 
    applicationData.applicantName ||
    applicationData.userDetails?.name ||
    applicationData.UserInfo?.[0]?.name ||
    applicationData.applicantInfo?.name ||
    'N/A';

  const applicantEmail = 
    applicationData.userDetails?.email ||
    applicationData.UserInfo?.[0]?.email ||
    applicationData.contactInfo?.email ||
    applicationData.email ||
    'N/A';

  const applicantPhone = 
    applicationData.userDetails?.phoneNumber ||
    applicationData.UserInfo?.[0]?.phone ||
    applicationData.UserInfo?.[0]?.phoneNumber ||
    applicationData.contactInfo?.mobileNumber ||
    applicationData.phoneNumber ||
    'N/A';

  // Get additional applicant information
  const userInfo = applicationData.UserInfo?.[0] || applicationData.userDetails || {};
  const applicantCity = userInfo.city || userInfo.Address || applicationData.city || 'N/A';
  const applicantAddress = userInfo.address || userInfo.Address || applicationData.address || 'N/A';
  const applicantOccupation = userInfo.occupation || applicationData.occupation || 'N/A';
  const applicantIncome = userInfo.monthlyIncome || applicationData.monthlyIncome || 0;

  const applicantInfo = [
    ['Name', applicantName],
    ['Email', applicantEmail],
    ['Phone', applicantPhone],
    ['City', applicantCity],
    ['Address', applicantAddress],
    ['Occupation', applicantOccupation],
    ['Monthly Income', applicantIncome > 0 ? `PKR ${applicantIncome.toLocaleString()}` : 'N/A'],
  ];

  callAutoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Value']],
    body: applicantInfo,
    theme: 'grid',
    margin: { left: 14, right: 14 },
    rowPageBreak: 'avoid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
      overflow: 'linebreak',
      valign: 'top'
    },
    headStyles: {
      fillColor: [229, 57, 53],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: {
        cellWidth: 45,
        overflow: 'ellipsize',
        fontStyle: 'bold'
      },
      1: {
        cellWidth: 'auto',
        overflow: 'linebreak'
      }
    },
  });

  yPosition = (doc.lastAutoTable?.finalY || yPosition) + 15;
  checkPageBreak(30);

  // Application Type Specific Details
  if (applicationType === 'installment') {
    checkPageBreak(30);
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPosition - 5, pageWidth - 28, 8, 'F');
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(229, 57, 53);
    doc.text('Installment Plan Details', 14, yPosition);
    yPosition += 12;

    const planDetails = [];
    
    // Get plan details from multiple possible locations
    const planInfo = applicationData.PlanInfo?.[0] || applicationData.PlanInfo?.[1] || {};
    const planDetailsData = applicationData.planDetails || {};
    
    // Product and company info
    if (planDetailsData.productName) {
      planDetails.push(['Product Name', planDetailsData.productName]);
    }
    if (planDetailsData.companyName) {
      planDetails.push(['Company Name', planDetailsData.companyName]);
    }
    
    // Price information
    const totalPrice = planDetailsData.price || planInfo.totalPrice || planInfo.totalAmount || 0;
    if (totalPrice > 0) {
      planDetails.push(['Total Price', `PKR ${totalPrice.toLocaleString()}`]);
    }
    
    // Selected plan information
    if (planInfo.planName) {
      planDetails.push(['Plan Name', planInfo.planName]);
    }
    
    const monthlyInstallment = planInfo.monthlyInstallment || planInfo.installmentPrice || 0;
    if (monthlyInstallment > 0) {
      planDetails.push(['Monthly Installment', `PKR ${monthlyInstallment.toLocaleString()}`]);
    }
    
    const downPayment = planInfo.downPayment || 0;
    if (downPayment > 0) {
      planDetails.push(['Down Payment', `PKR ${downPayment.toLocaleString()}`]);
    }
    
    const tenure = planInfo.tenureMonths || planInfo.tenure || 0;
    if (tenure > 0) {
      planDetails.push(['Tenure', `${tenure} months`]);
    }
    
    if (planInfo.interestRatePercent || planInfo.interestRate) {
      planDetails.push(['Interest Rate', `${planInfo.interestRatePercent || planInfo.interestRate}%`]);
    }
    
    if (planInfo.totalPayable) {
      planDetails.push(['Total Payable', `PKR ${planInfo.totalPayable.toLocaleString()}`]);
    }
    
    // If no plan details found, try to get from paymentPlans
    if (planDetails.length === 0 && planDetailsData.paymentPlans && planDetailsData.paymentPlans.length > 0) {
      const firstPlan = planDetailsData.paymentPlans[0];
      if (firstPlan.planName) planDetails.push(['Plan Name', firstPlan.planName]);
      if (firstPlan.monthlyInstallment) {
        planDetails.push(['Monthly Installment', `PKR ${firstPlan.monthlyInstallment.toLocaleString()}`]);
      }
      if (firstPlan.downPayment) {
        planDetails.push(['Down Payment', `PKR ${firstPlan.downPayment.toLocaleString()}`]);
      }
      if (firstPlan.tenureMonths || firstPlan.tenure) {
        planDetails.push(['Tenure', `${firstPlan.tenureMonths || firstPlan.tenure} months`]);
      }
      if (firstPlan.interestRatePercent || firstPlan.interestRate) {
        planDetails.push(['Interest Rate', `${firstPlan.interestRatePercent || firstPlan.interestRate}%`]);
      }
      if (firstPlan.totalPayable) {
        planDetails.push(['Total Payable', `PKR ${firstPlan.totalPayable.toLocaleString()}`]);
      }
      if (firstPlan.totalCost || firstPlan.totalCostToCustomer) {
        planDetails.push(['Total Cost', `PKR ${(firstPlan.totalCost || firstPlan.totalCostToCustomer).toLocaleString()}`]);
      }
    }
    
    // Also check applicationData directly for plan info
    if (planDetails.length === 0) {
      if (applicationData.planName) planDetails.push(['Plan Name', applicationData.planName]);
      if (applicationData.monthlyInstallment) {
        planDetails.push(['Monthly Installment', `PKR ${applicationData.monthlyInstallment.toLocaleString()}`]);
      }
      if (applicationData.downPayment) {
        planDetails.push(['Down Payment', `PKR ${applicationData.downPayment.toLocaleString()}`]);
      }
      if (applicationData.tenure || applicationData.tenureMonths) {
        planDetails.push(['Tenure', `${applicationData.tenureMonths || applicationData.tenure} months`]);
      }
    }

    if (planDetails.length > 0) {
      callAutoTable(doc, {
        startY: yPosition,
        head: [['Field', 'Value']],
        body: planDetails,
        theme: 'grid',
        margin: { left: 14, right: 14 },
        rowPageBreak: 'avoid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
          overflow: 'linebreak',
          valign: 'top'
        },
        headStyles: {
          fillColor: [229, 57, 53],
          textColor: 255,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: {
            cellWidth: 45,
            overflow: 'ellipsize',
            fontStyle: 'bold'
          },
          1: {
            cellWidth: 'auto',
            overflow: 'linebreak'
          }
        },
      });
      yPosition = (doc.lastAutoTable?.finalY || yPosition) + 15;
    }

    // Payment Plans Table
    if (applicationData.planDetails?.paymentPlans && applicationData.planDetails.paymentPlans.length > 0) {
      checkPageBreak(40);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Available Payment Plans', 14, yPosition);
      yPosition += 8;

      const plansData = applicationData.planDetails.paymentPlans.map((plan, idx) => [
        plan.planName || `Plan ${idx + 1}`,
        `PKR ${(plan.monthlyInstallment || 0).toLocaleString()}`,
        `${plan.tenureMonths || plan.tenure || 0} months`,
        `PKR ${(plan.downPayment || 0).toLocaleString()}`,
        `${plan.interestRatePercent || plan.interestRate || 0}%`,
      ]);

      callAutoTable(doc, {
        startY: yPosition,
        head: [['Plan Name', 'Monthly Installment', 'Tenure', 'Down Payment', 'Interest Rate']],
        body: plansData,
        theme: 'grid',
        headStyles: { fillColor: [229, 57, 53], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 2 },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 'auto', minCellWidth: 35 },
          1: { cellWidth: 'auto', minCellWidth: 35 },
          2: { cellWidth: 'auto', minCellWidth: 25 },
          3: { cellWidth: 'auto', minCellWidth: 35 },
          4: { cellWidth: 'auto', minCellWidth: 30 },
        },
      });
      yPosition = (doc.lastAutoTable?.finalY || yPosition) + 15;
    }
  } else if (applicationType === 'loan') {
    checkPageBreak(30);
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPosition - 5, pageWidth - 28, 8, 'F');
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(229, 57, 53);
    doc.text('Loan Application Details', 14, yPosition);
    yPosition += 12;

    const loanDetails = [
      ['Product Name', applicationData.productName || 'N/A'],
      ['Bank Name', applicationData.bankName || 'N/A'],
      ['Requested Amount', applicationData.loanRequirement?.requestedAmount 
        ? `PKR ${applicationData.loanRequirement.requestedAmount.toLocaleString()}` 
        : 'N/A'],
      ['Status', (applicationData.status || 'N/A').toUpperCase()],
    ];

    callAutoTable(doc, {
      startY: yPosition,
      head: [['Field', 'Value']],
      body: loanDetails,
      theme: 'grid',
      margin: { left: 14, right: 14 },
      rowPageBreak: 'avoid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
        valign: 'top'
      },
      headStyles: {
        fillColor: [229, 57, 53],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: {
          cellWidth: 45,
          overflow: 'ellipsize',
          fontStyle: 'bold'
        },
        1: {
          cellWidth: 'auto',
          overflow: 'linebreak'
        }
      },
    });
    yPosition = (doc.lastAutoTable?.finalY || yPosition) + 15;
  } else if (applicationType === 'property') {
    checkPageBreak(30);
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPosition - 5, pageWidth - 28, 8, 'F');
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(229, 57, 53);
    doc.text('Property Application Details', 14, yPosition);
    yPosition += 12;

    const propertyDetails = [
      ['Property Type', applicationData.propertyType || 'N/A'],
      ['Location', applicationData.location || 'N/A'],
      ['Price', applicationData.price ? `PKR ${applicationData.price.toLocaleString()}` : 'N/A'],
    ];

    callAutoTable(doc, {
      startY: yPosition,
      head: [['Field', 'Value']],
      body: propertyDetails,
      theme: 'grid',
      margin: { left: 14, right: 14 },
      rowPageBreak: 'avoid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
        valign: 'top'
      },
      headStyles: {
        fillColor: [229, 57, 53],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: {
          cellWidth: 45,
          overflow: 'ellipsize',
          fontStyle: 'bold'
        },
        1: {
          cellWidth: 'auto',
          overflow: 'linebreak'
        }
      },
    });
    yPosition = (doc.lastAutoTable?.finalY || yPosition) + 15;
  }

  // Note if available
  if (assignmentData.note) {
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Additional Notes', 14, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitNote = doc.splitTextToSize(assignmentData.note, pageWidth - 28);
    doc.text(splitNote, 14, yPosition);
    yPosition += splitNote.length * 5 + 10;
  }

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} | Generated on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Generate filename
  const filename = `Assignment_${assignmentData._id?.toString().slice(-8) || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
  } catch (error) {
    console.error('Error generating assignment PDF:', error);
    throw error;
  }
};

/**
 * Generate PDF for multiple assignments (complete list)
 */
export const generateAssignmentsListPDF = (assignments, filters = {}) => {
  // Use A4 paper size
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header with improved styling
  doc.setFillColor(229, 57, 53);
  doc.rect(0, 0, pageWidth, 45, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('MADADGAAR', pageWidth / 2, 22, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Complete Assignments Report', pageWidth / 2, 32, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 40, { align: 'center' });

  yPosition = 55;
  doc.setTextColor(0, 0, 0);

  // Report Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Total Assignments: ${assignments.length}`, 14, yPosition);
  yPosition += 10;

  // Filter Info
  if (Object.keys(filters).length > 0) {
    const filterText = Object.entries(filters)
      .filter(([key, value]) => value && key !== 'page' && key !== 'limit')
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    if (filterText) {
      doc.text(`Filters: ${filterText}`, 14, yPosition);
      yPosition += 10;
    }
  }

  // Summary Statistics
  const statusCounts = {};
  const typeCounts = {};
  assignments.forEach(assignment => {
    const status = (assignment.assignment?.status || assignment.status || 'pending').toUpperCase();
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    
    const type = (assignment.applicationType || assignment.applicationData?.type || 'unknown').toUpperCase();
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', 14, yPosition);
  yPosition += 8;

  const summaryData = Object.entries(statusCounts).map(([status, count]) => [status, count.toString()]);

  callAutoTable(doc, {
    startY: yPosition,
    head: [['Status', 'Count']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [229, 57, 53], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  yPosition = doc.lastAutoTable.finalY + 10;

  // Assignments Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Assignments List', 14, yPosition);
  yPosition += 8;

  const tableData = assignments.map((assignment, index) => {
    const assignmentData = assignment.assignment || assignment;
    const applicationData = assignment.applicationData || {};
    const applicantName = 
      applicationData.applicantName ||
      applicationData.userDetails?.name ||
      applicationData.UserInfo?.[0]?.name ||
      applicationData.applicantInfo?.name ||
      'N/A';

    return [
      (index + 1).toString(),
      assignmentData._id?.toString().slice(-8) || 'N/A',
      applicantName,
      (assignment.applicationType || assignment.applicationData?.type || 'unknown').toUpperCase(),
      (assignmentData.status || assignment.status || 'pending').toUpperCase(),
      assignmentData.category || 'N/A',
      assignmentData.city || 'N/A',
      formatDate(assignmentData.assigenAt || assignmentData.createdAt),
    ];
  });

  callAutoTable(doc, {
    startY: yPosition,
    head: [['#', 'ID', 'Applicant', 'Type', 'Status', 'Category', 'City', 'Assigned Date']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [229, 57, 53], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2 },
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 20 },
      2: { cellWidth: 40 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 30 },
      6: { cellWidth: 30 },
      7: { cellWidth: 35 },
    },
  });

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} | Generated on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Generate filename
  const filename = `Assignments_Complete_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

/**
 * Helper function to format dates
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return 'N/A';
  }
};
