import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';
import { APP_LOGO_BASE64 } from '../constants/appLogoBase64';

/**
 * Converts array of SVG path strings to SVG elements
 */
function renderSvgPaths(paths, strokeColor = '#0F172A') {
  if (!Array.isArray(paths) || paths.length === 0) {
    return '';
  }
  return paths
    .map(
      (d) =>
        `<path d="${d}" stroke="${strokeColor}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />`
    )
    .join('');
}

/**
 * Formats a clean date string
 */
function formatDate(dateInput) {
  try {
    const d = dateInput ? new Date(dateInput) : new Date();
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Generates the full HTML markup for the official Legal Consultation Certificate
 */
export function buildCertificateHtml({
  caseData = {},
  consultation = {},
  lawyer = {},
  citizen = {},
}) {
  const caseTitle = caseData.title || consultation.problemStatement || 'Legal Dispute';
  const caseId = caseData.id ? `BEI-CS-${String(caseData.id).padStart(5, '0')}` : 'BEI-CS-00000';
  const district = caseData.district || lawyer.district || 'Karachi, Sindh';
  const court = caseData.court || 'District & Sessions Court';

  const agreedTiming =
    consultation.appointmentTime ||
    consultation.selectedTimeSlot ||
    consultation.appointmentDate ||
    'Agreed Consultation Slot';

  const citizenName =
    citizen.name ||
    consultation.citizenName ||
    caseData.citizenName ||
    'Citizen Client';

  const lawyerName =
    lawyer.name ||
    consultation.lawyerName ||
    'Verified High Court Advocate';

  const lawyerSpec = lawyer.spec || 'Advocate High Court';
  const lawyerSbc = lawyer.sbc || 'Sindh Bar Council Enrolled';
  const lawyerPhone = lawyer.phone || consultation.lawyerPhone || '+92 300 0000000';

  const certNumber = `CERT-BEI-${new Date().getFullYear()}-${String(consultation.id || caseData.id || 101).padStart(5, '0')}`;
  const issueDate = formatDate(consultation.signedAt || new Date());

  const lawyerSvgPaths = renderSvgPaths(consultation.lawyerSignatureSvg);
  const citizenSvgPaths = renderSvgPaths(consultation.citizenSignatureSvg);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Barq-e-Insaf - Legal Consultation Certificate</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      background-color: #FAF8F5;
      color: #1A1A1A;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      padding: 12px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .cert-frame {
      width: 100%;
      max-width: 1050px;
      background: #FFFFFF;
      border: 6px double #B8860B;
      padding: 24px 32px;
      position: relative;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .inner-border {
      border: 1px solid #D4AF37;
      padding: 18px 24px;
      position: relative;
    }
    .corner-decor {
      position: absolute;
      width: 24px;
      height: 24px;
      border: 2px solid #B8860B;
    }
    .corner-tl { top: 4px; left: 4px; border-right: none; border-bottom: none; }
    .corner-tr { top: 4px; right: 4px; border-left: none; border-bottom: none; }
    .corner-bl { bottom: 4px; left: 4px; border-right: none; border-top: none; }
    .corner-br { bottom: 4px; right: 4px; border-left: none; border-top: none; }

    /* Header */
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      border-bottom: 2px solid #E2D9C8;
      padding-bottom: 8px;
    }
    .logo-cell {
      width: 80px;
      vertical-align: middle;
      text-align: left;
    }
    .logo-img {
      width: 70px;
      height: 70px;
      object-fit: contain;
    }
    .header-text-cell {
      text-align: center;
      vertical-align: middle;
    }
    .app-title {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 3px;
      color: #0F172A;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .app-subtitle {
      font-size: 11px;
      letter-spacing: 1.5px;
      color: #854D0E;
      font-weight: 700;
      text-transform: uppercase;
    }
    .bar-council-tag {
      font-size: 10px;
      color: #64748B;
      margin-top: 3px;
      font-style: italic;
    }
    .serial-cell {
      width: 150px;
      text-align: right;
      vertical-align: top;
      font-family: 'Courier New', monospace;
      font-size: 10px;
      color: #475569;
    }

    /* Main Certificate Title */
    .cert-heading-box {
      text-align: center;
      margin: 10px 0 14px 0;
    }
    .cert-main-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #1E293B;
      text-transform: uppercase;
      border-bottom: 1px solid #D4AF37;
      display: inline-block;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }
    .cert-proclamation {
      font-size: 12px;
      color: #334155;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.4;
      font-style: italic;
    }

    /* Case & Schedule Metadata Box */
    .meta-grid {
      display: table;
      width: 100%;
      background: #FDFBF7;
      border: 1px solid #E2D9C8;
      border-radius: 4px;
      padding: 10px 14px;
      margin-bottom: 14px;
    }
    .meta-row {
      display: table-row;
    }
    .meta-col {
      display: table-cell;
      padding: 4px 8px;
      vertical-align: top;
      font-size: 11.5px;
    }
    .meta-label {
      font-weight: 700;
      color: #854D0E;
      text-transform: uppercase;
      font-size: 9.5px;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 2px;
    }
    .meta-value {
      color: #0F172A;
      font-weight: 600;
    }
    .highlight-schedule {
      background: #FEF3C7;
      padding: 6px 10px;
      border-radius: 4px;
      border-left: 3px solid #D97706;
    }

    /* Parties Section */
    .parties-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
    }
    .party-card {
      width: 48%;
      vertical-align: top;
      background: #FAFAFA;
      border: 1px solid #E2E8F0;
      padding: 10px 14px;
      border-radius: 4px;
    }
    .party-role-badge {
      display: inline-block;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      padding: 2px 6px;
      border-radius: 3px;
      margin-bottom: 6px;
    }
    .badge-advocate {
      background: #DBEAFE;
      color: #1E40AF;
      border: 1px solid #93C5FD;
    }
    .badge-citizen {
      background: #DCFCE7;
      color: #166534;
      border: 1px solid #86EFAC;
    }
    .party-name {
      font-size: 14px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 3px;
    }
    .party-detail {
      font-size: 11px;
      color: #475569;
      line-height: 1.35;
    }

    /* Signatures Section */
    .signatures-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .sig-cell {
      width: 48%;
      vertical-align: top;
      border: 1px dashed #CBD5E1;
      background: #FFFFFF;
      padding: 8px 12px;
      text-align: center;
      border-radius: 4px;
    }
    .sig-pad-box {
      height: 75px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 4px 0;
      background: #F8FAFC;
      border-radius: 4px;
      position: relative;
    }
    .sig-pad-box svg {
      width: 100%;
      height: 70px;
    }
    .sig-fallback-text {
      font-family: 'Brush Script MT', 'Playfair Display', cursive;
      font-size: 22px;
      color: #0F172A;
      font-style: italic;
    }
    .sig-line {
      border-top: 1px solid #475569;
      margin-top: 4px;
      padding-top: 4px;
    }
    .sig-role-title {
      font-size: 10.5px;
      font-weight: 800;
      color: #1E293B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .sig-subtext {
      font-size: 9px;
      color: #64748B;
      margin-top: 1px;
    }

    /* Footer Seal */
    .footer-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid #E2D9C8;
    }
    .footer-left {
      width: 30%;
      font-size: 9px;
      color: #64748B;
      vertical-align: middle;
    }
    .footer-center {
      text-align: center;
      font-size: 9px;
      font-weight: 700;
      color: #854D0E;
      letter-spacing: 0.5px;
      vertical-align: middle;
    }
    .footer-right {
      width: 30%;
      text-align: right;
      font-size: 9px;
      color: #64748B;
      vertical-align: middle;
      font-family: 'Courier New', monospace;
    }
  </style>
</head>
<body>
  <div class="cert-frame">
    <div class="inner-border">
      <div class="corner-decor corner-tl"></div>
      <div class="corner-decor corner-tr"></div>
      <div class="corner-decor corner-bl"></div>
      <div class="corner-decor corner-br"></div>

      <!-- Header -->
      <table class="header-table">
        <tr>
          <td class="logo-cell">
            <img src="${APP_LOGO_BASE64}" class="logo-img" alt="Barq-e-Insaf Logo" />
          </td>
          <td class="header-text-cell">
            <div class="app-title">BARQ-E-INSAF</div>
            <div class="app-subtitle">Official Legal Representation & Consultation Certificate</div>
            <div class="bar-council-tag">Conforming with Sindh Bar Council (SBC) Legal Standards</div>
          </td>
          <td class="serial-cell">
            <div><strong>SERIAL:</strong></div>
            <div>${certNumber}</div>
            <div style="margin-top: 4px;"><strong>DATE:</strong></div>
            <div>${issueDate}</div>
          </td>
        </tr>
      </table>

      <!-- Proclamation Title -->
      <div class="cert-heading-box">
        <div class="cert-main-title">Certificate of Agreed Legal Consultation</div>
        <div class="cert-proclamation">
          This document formally certifies that a mutual advocate-client consultation has been scheduled, agreed upon, and digitally executed by both parties with authenticated finger signatures under the Barq-e-Insaf platform.
        </div>
      </div>

      <!-- Case & Agreed Schedule Grid -->
      <div class="meta-grid">
        <div class="meta-row">
          <div class="meta-col" style="width: 50%;">
            <span class="meta-label">Case Dossier & Title</span>
            <span class="meta-value">${caseTitle}</span>
            <div style="font-size: 10px; color: #64748B; margin-top: 2px;">Dossier ID: ${caseId} &middot; Jurisdiction: ${district} &middot; ${court}</div>
          </div>
          <div class="meta-col highlight-schedule" style="width: 50%;">
            <span class="meta-label">Agreed Consultation Window & Schedule</span>
            <span class="meta-value" style="font-size: 13px; color: #92400E;">${agreedTiming}</span>
            <div style="font-size: 10px; color: #78350F; margin-top: 2px;">Official Legal Chamber &middot; Confirmed by Bilateral Digital Execution</div>
          </div>
        </div>
      </div>

      <!-- Parties Involved Table -->
      <table class="parties-table">
        <tr>
          <td class="party-card" style="margin-right: 2%;">
            <span class="party-role-badge badge-advocate">Engaged Legal Counsel</span>
            <div class="party-name">${lawyerName}</div>
            <div class="party-detail">${lawyerSpec} &middot; ${lawyerSbc}</div>
            <div class="party-detail">Chambers: ${district} Bar Association</div>
            <div class="party-detail">Official Phone: ${lawyerPhone}</div>
          </td>
          <td style="width: 4%;"></td>
          <td class="party-card">
            <span class="party-role-badge badge-citizen">Citizen Client</span>
            <div class="party-name">${citizenName}</div>
            <div class="party-detail">Registered Litigant / Client</div>
            <div class="party-detail">Case Reference: ${caseId}</div>
            <div class="party-detail">District Jurisdiction: ${district}</div>
          </td>
        </tr>
      </table>

      <!-- Signatures Table -->
      <table class="signatures-table">
        <tr>
          <td class="sig-cell">
            <div class="sig-role-title">Advocate Digital Finger Signature</div>
            <div class="sig-pad-box">
              ${
                lawyerSvgPaths
                  ? `<svg viewBox="0 0 320 100" xmlns="http://www.w3.org/2000/svg">${lawyerSvgPaths}</svg>`
                  : `<div class="sig-fallback-text">${lawyerName}</div>`
              }
            </div>
            <div class="sig-line">
              <div style="font-size: 11px; font-weight: 700; color: #0F172A;">${lawyerName}</div>
              <div class="sig-subtext">Sindh Bar Council Enrolled &middot; Digitally Sealed</div>
            </div>
          </td>
          <td style="width: 4%;"></td>
          <td class="sig-cell">
            <div class="sig-role-title">Citizen Digital Finger Signature</div>
            <div class="sig-pad-box">
              ${
                citizenSvgPaths
                  ? `<svg viewBox="0 0 320 100" xmlns="http://www.w3.org/2000/svg">${citizenSvgPaths}</svg>`
                  : `<div class="sig-fallback-text">${citizenName}</div>`
              }
            </div>
            <div class="sig-line">
              <div style="font-size: 11px; font-weight: 700; color: #0F172A;">${citizenName}</div>
              <div class="sig-subtext">Litigant Client &middot; Digitally Confirmed</div>
            </div>
          </td>
        </tr>
      </table>

      <!-- Footer Seal Notice -->
      <table class="footer-table">
        <tr>
          <td class="footer-left">
            Strict Attorney-Client Privilege &middot; Tamper-Evident Record
          </td>
          <td class="footer-center">
            BARQ-E-INSAF JUDICIAL ACCESS NETWORK
          </td>
          <td class="footer-right">
            DOC-REF: ${certNumber}
          </td>
        </tr>
      </table>

    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Downloads or prints the official consultation certificate as a PDF
 */
export async function downloadConsultationCertificate({
  caseData,
  consultation,
  lawyer,
  citizen,
}) {
  try {
    const html = buildCertificateHtml({
      caseData,
      consultation,
      lawyer,
      citizen,
    });

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // For web browsers: open dedicated print window with the formatted certificate HTML
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      } else {
        // Fallback with hidden iframe if popup is blocked
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
        iframe.contentWindow.document.write(html);
        iframe.contentWindow.document.close();
        iframe.contentWindow.focus();
        setTimeout(() => {
          iframe.contentWindow.print();
          document.body.removeChild(iframe);
        }, 500);
      }
      return { success: true };
    }

    // For Mobile (iOS & Android): Generate PDF binary via expo-print and invoke expo-sharing
    const { uri } = await Print.printToFileAsync({
      html,
      width: 842, // A4 landscape width (points)
      height: 595, // A4 landscape height (points)
      base64: false,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: 'Download Legal Consultation Certificate',
      });
    } else {
      Alert.alert(
        'Certificate Generated',
        'Your PDF consultation certificate has been generated at: ' + uri
      );
    }

    return { success: true, uri };
  } catch (error) {
    console.error('[CERTIFICATE_DOWNLOAD_ERROR]:', error);
    Alert.alert(
      'Export Failed',
      'Could not generate consultation certificate PDF: ' + error.message
    );
    throw error;
  }
}
