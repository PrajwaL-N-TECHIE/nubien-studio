import jsPDF from 'jspdf';

export interface BFormQuestion {
  id: string;
  title: string;
  type: 'short_text' | 'paragraph' | 'radio' | 'checkbox' | 'rating';
  required: boolean;
  options?: string[];
  ratingMax?: number;
}

export interface BForm {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  questions: BFormQuestion[];
  createdAt?: any;
  updatedAt?: any;
  responseCount?: number;
  status?: 'active' | 'closed';
}

export interface BFormResponse {
  id: string;
  formId: string;
  submittedAt: any;
  answers: { [questionId: string]: any };
  respondentName?: string;
  respondentEmail?: string;
}

/**
 * Recursively removes all `undefined` values from an object or array
 * so that Firestore serialization never fails with:
 * "Unsupported field value: undefined"
 */
export function cleanFirestorePayload<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => cleanFirestorePayload(item)) as any;
  }
  if (typeof data === 'object') {
    // Preserve Firestore Sentinels (serverTimestamp, deleteField, FieldValue, Timestamp)
    if (data.constructor && data.constructor.name !== 'Object') {
      return data;
    }
    const cleanObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleanObj[key] = cleanFirestorePayload(value);
      }
    }
    return cleanObj as any;
  }
  return data;
}

/**
 * Ensures a question object contains only valid defined fields
 * suitable for Firestore storage.
 */
export function sanitizeFormQuestion(q: Partial<BFormQuestion>, index: number = 0): BFormQuestion {
  const type = q.type || 'short_text';
  const cleanQ: BFormQuestion = {
    id: q.id || `q_${Date.now()}_${index}`,
    title: (q.title || '').trim(),
    type,
    required: Boolean(q.required)
  };

  if (type === 'radio' || type === 'checkbox') {
    const validOptions = Array.isArray(q.options)
      ? q.options.map((opt) => String(opt || '').trim()).filter(Boolean)
      : [];
    cleanQ.options = validOptions.length > 0 ? validOptions : ['Option 1', 'Option 2'];
  }

  if (type === 'rating') {
    cleanQ.ratingMax = typeof q.ratingMax === 'number' && q.ratingMax > 0 ? q.ratingMax : 5;
  }

  return cleanQ;
}

/**
 * Universal file downloader for Desktop, Android, and iOS Safari.
 */
export const triggerFileDownload = (blob: Blob, filename: string) => {
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);

  if (isIOS) {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  }

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 300);
};

/**
 * Format answer value into display string
 */
export const formatAnswerValue = (val: any): string => {
  if (val === null || val === undefined || val === '') return '-';
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

/**
 * Export responses as RFC-4180 CSV
 */
export const downloadFormResponsesCSV = (form: BForm, responses: BFormResponse[]) => {
  const escapeCSV = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

  // Headers: Submission ID, Date & Time, Respondent, followed by each question
  const headers = [
    'Submission ID',
    'Date & Time',
    'Respondent Name',
    'Respondent Email',
    ...form.questions.map(q => q.title)
  ];

  const rows = responses.map((resp, idx) => {
    const dateStr = resp.submittedAt?.toDate
      ? resp.submittedAt.toDate().toLocaleString()
      : resp.submittedAt
      ? new Date(resp.submittedAt).toLocaleString()
      : `Submission #${idx + 1}`;

    const questionAnswers = form.questions.map(q => {
      const ans = resp.answers ? resp.answers[q.id] : undefined;
      return formatAnswerValue(ans);
    });

    return [
      resp.id || `SUB-${idx + 1}`,
      dateStr,
      resp.respondentName || 'Anonymous',
      resp.respondentEmail || 'N/A',
      ...questionAnswers
    ];
  });

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const sanitizedTitle = (form.title || 'b_forms_responses')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase();

  triggerFileDownload(blob, `${sanitizedTitle}_responses_${Date.now()}.csv`);
};

/**
 * Export responses as a branded PDF report
 */
export const downloadFormResponsesPDF = (form: BForm, responses: BFormResponse[]) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = margin;

  // Background Dark Theme Header
  doc.setFillColor(12, 12, 18);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Purple Accent Line
  doc.setFillColor(168, 85, 247);
  doc.rect(0, 41, pageWidth, 1.5, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('B-Forms • Feedback & Survey Report', margin, y + 8);

  // Subtitle Form Title
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(216, 180, 254);
  const truncatedTitle = form.title.length > 55 ? form.title.substring(0, 55) + '...' : form.title;
  doc.text(truncatedTitle, margin, y + 15);

  // Metadata: Date & Total Responses
  doc.setFontSize(9);
  doc.setTextColor(161, 161, 170);
  const dateGenerated = new Date().toLocaleDateString();
  doc.text(`Generated: ${dateGenerated}  |  Total Submissions: ${responses.length}  |  Questions: ${form.questions.length}`, margin, y + 22);

  y = 52;

  // Summary Metrics Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('EXECUTIVE SUMMARY', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Total Form Submissions: ${responses.length}`, margin + 4, y + 13);
  doc.text(`Status: ${form.status || 'Active'}`, margin + 60, y + 13);
  doc.text(`Export Type: Full Participant Response Log`, margin + 110, y + 13);

  y += 28;

  // Render Questions Breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Individual Responses Log', margin, y);
  y += 6;

  if (responses.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('No responses collected yet for this form.', margin, y + 5);
  } else {
    // Print each response card
    responses.forEach((resp, rIdx) => {
      // Check page overflow
      if (y > pageHeight - 45) {
        doc.addPage();
        y = margin + 5;
      }

      const dateStr = resp.submittedAt?.toDate
        ? resp.submittedAt.toDate().toLocaleString()
        : resp.submittedAt
        ? new Date(resp.submittedAt).toLocaleString()
        : `Submission #${rIdx + 1}`;

      // Response Card Header
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 8, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      const respondentLabel = resp.respondentName ? `${resp.respondentName} (${resp.respondentEmail || 'N/A'})` : `Respondent #${rIdx + 1}`;
      doc.text(respondentLabel, margin + 3, y + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(dateStr, pageWidth - margin - 40, y + 5.5);

      y += 11;

      // Print answers
      form.questions.forEach((q) => {
        if (y > pageHeight - 25) {
          doc.addPage();
          y = margin + 5;
        }

        const ans = resp.answers ? resp.answers[q.id] : undefined;
        const ansStr = formatAnswerValue(ans);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const qTitle = `Q: ${q.title}`;
        doc.text(qTitle, margin + 4, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);

        // Word wrap answer text
        const splitAns = doc.splitTextToSize(`A: ${ansStr}`, pageWidth - margin * 2 - 8);
        doc.text(splitAns, margin + 4, y + 4);

        y += 4 + splitAns.length * 4;
      });

      y += 5; // spacing between responses
    });
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${totalPages}  •  B-Forms by Buildicy`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  const sanitizedTitle = (form.title || 'b_forms_report')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase();

  doc.save(`${sanitizedTitle}_report_${Date.now()}.pdf`);
};
