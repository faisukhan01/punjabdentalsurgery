// Appointment receipt PDF (client-side, generated with jsPDF on download).
//
// A branded A4 letterhead: clinic logo, doctor name & contact, the patient's
// per-day token number front and centre, and every detail they filled in
// while booking. Theme matches the site — brand blue #12588f, teal accent,
// no yellows/golds (standing clinic constraint).

import { format, parseISO } from "date-fns";
import { CLINIC } from "./clinic";

export interface ReceiptData {
  tokenNumber: number;
  name: string;
  phone: string;
  email?: string | null;
  service: string;
  /** Appointment date as YYYY-MM-DD (clinic local). */
  date: string;
  timeSlot: string;
  /** Optional note the patient wrote (purpose / problem). */
  message?: string | null;
}

/* ------------------------------- palette ------------------------------- */

const BLUE = [18, 88, 143] as const; // #12588f — brand primary
const TEAL = [26, 154, 162] as const; // #1a9aa2 — brand accent
const INK = [30, 41, 59] as const; // headings / values
const GRAY = [100, 116, 139] as const; // labels / secondary
const CARD = [242, 247, 251] as const; // light blue-tinted panel
const LINE = [223, 232, 240] as const; // hairlines
const WHITE = [255, 255, 255] as const;

/* logo aspect ratio (public/logo-receipt.png is 640x511) */
const LOGO_RATIO = 511 / 640;

/* ------------------------------ logo cache ------------------------------ */

let logoCache: string | null | undefined;

async function loadLogo(): Promise<string | null> {
  if (logoCache !== undefined) return logoCache;
  try {
    const res = await fetch("/logo-receipt.png");
    if (!res.ok) return (logoCache = null);
    const blob = await res.blob();
    logoCache = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return logoCache;
  } catch {
    return (logoCache = null);
  }
}

/* ------------------------------- helpers ------------------------------- */

/** 1 -> "001" (matches the in-app token display). */
function token3(n: number): string {
  return String(Math.max(1, n)).padStart(3, "0");
}

/** "2026-01-26" -> "Monday, 26 January 2026". */
function prettyDate(dateStr: string): string {
  try {
    return format(parseISO(`${dateStr}T12:00:00`), "EEEE, d MMMM yyyy");
  } catch {
    return dateStr;
  }
}

/** Receipt issue timestamp, e.g. "26 Jan 2026, 8:45 pm". */
function issuedLabel(d: Date = new Date()): string {
  return format(d, "d MMM yyyy, h:mm a");
}

/** Receipt file name, e.g. "Punjab-Dental-Surgery-Receipt-Token-001.pdf". */
export function receiptFileName(tokenNumber: number): string {
  return `Punjab-Dental-Surgery-Receipt-Token-${token3(tokenNumber)}.pdf`;
}

/* ----------------------------- pdf builder ----------------------------- */

/**
 * Builds the receipt as a jsPDF document. `logoDataUrl` can be injected
 * (tests / preview scripts); by default the bundled clinic logo is fetched.
 */
export async function buildReceiptPdf(
  data: ReceiptData,
  logoDataUrl?: string | null
): Promise<import("jspdf").jsPDF> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const W = 210;
  const M = 16; // page margin
  const CW = W - M * 2; // content width
  const CX = W / 2;

  doc.setProperties({
    title: `Appointment Receipt — Token ${token3(data.tokenNumber)} — ${CLINIC.name}`,
    subject: "Appointment booking receipt",
    author: CLINIC.name,
    creator: CLINIC.name,
  });

  /* ------------------------------ letterhead ------------------------------ */

  const logo = logoDataUrl !== undefined ? logoDataUrl : await loadLogo();
  let y = 13;
  if (logo) {
    const lw = 34;
    const lh = lw * LOGO_RATIO;
    doc.addImage(logo, "PNG", (W - lw) / 2, y, lw, lh);
    y += lh;
  }

  y += 7.4; // 47.5 with logo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(...INK);
  doc.text(`${CLINIC.doctor.replace("Dr. ", "Dr ")}  ·  ${CLINIC.qualifications}`, CX, y, {
    align: "center",
  });

  y += 6;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...TEAL);
  doc.text(CLINIC.tagline, CX, y, { align: "center", charSpace: 0.3 });

  y += 5.6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(
    `${CLINIC.address}      •      ${CLINIC.phone}`,
    CX,
    y,
    { align: "center" }
  );

  y += 5.2;
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.9);
  doc.line(M, y, W - M, y);
  y += 1.7;
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.35);
  doc.line(M, y, W - M, y);

  /* ------------------------------- title row ------------------------------ */

  y += 8.2; // baseline ~73.5
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...BLUE);
  doc.text("APPOINTMENT RECEIPT", M, y, { charSpace: 0.7 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text(`Issued ${issuedLabel()}`, W - M, y, { align: "right" });

  y += 4;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(M, y, W - M, y);

  /* ------------------------------ token block ----------------------------- */

  const tbW = 74;
  const tbH = 26;
  const tbX = (W - tbW) / 2;
  const tbY = y + 6.5;
  doc.setFillColor(...BLUE);
  doc.roundedRect(tbX, tbY, tbW, tbH, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...WHITE);
  doc.text("YOUR TOKEN NUMBER", CX, tbY + 9.4, {
    align: "center",
    charSpace: 1.2,
  });

  doc.setFontSize(21);
  doc.text(token3(data.tokenNumber), CX, tbY + 20.8, {
    align: "center",
    charSpace: 1.2,
  });

  y = tbY + tbH + 6.4;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text("Please show this token at the reception when you arrive.", CX, y, {
    align: "center",
  });

  /* --------------------------- appointment details ------------------------ */

  y += 11.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text("APPOINTMENT DETAILS", M, y, { charSpace: 1.1 });
  y += 4;

  const cardX = M;
  const cardW = CW;
  const padX = 5;
  const valueX = W - M - padX;

  type Row = { label: string; value: string; lines: string[]; h: number };
  const rows: Row[] = [];
  const pushRow = (label: string, value: string) => {
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(value, cardW - 62) as string[];
    rows.push({ label, value, lines, h: Math.max(9, 4.6 + lines.length * 4.7) });
  };
  pushRow("Patient name", data.name);
  pushRow("Phone number", data.phone);
  if (data.email) pushRow("Email", data.email);
  pushRow("Service", data.service);
  pushRow("Date", prettyDate(data.date));
  pushRow("Time", data.timeSlot);

  // Optional patient note — wrapped paragraph, capped at 3 lines so the
  // receipt always fits one page (the full note lives in the admin panel).
  const NOTE_W = cardW - padX * 2;
  let noteLines: string[] | null = null;
  if (data.message && data.message.trim()) {
    const all = doc.splitTextToSize(data.message.trim(), NOTE_W) as string[];
    noteLines = all.slice(0, 3);
    if (all.length > 3) noteLines[2] = `${noteLines[2].slice(0, -1)}…`;
  }

  const rowsH = 4 + rows.reduce((s, r) => s + r.h, 0);
  const noteH = noteLines ? 5.4 + 4.2 + noteLines.length * 4.3 + 2.6 : 0;
  const cardH = rowsH + noteH + 2.4;

  doc.setFillColor(...CARD);
  doc.roundedRect(cardX, y, cardW, cardH, 2.5, 2.5, "F");

  // rows
  let ry = y + 4;
  rows.forEach((row, i) => {
    if (i > 0) {
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.25);
      doc.line(cardX + padX, ry, valueX, ry);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY);
    doc.text(row.label, cardX + padX, ry + 5.9);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    row.lines.forEach((ln, li) => {
      doc.text(ln, valueX, ry + 5.9 + li * 4.7, { align: "right" });
    });
    ry += row.h;
  });

  // note block
  if (noteLines) {
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.25);
    doc.line(cardX + padX, ry, valueX, ry);
    ry += 5.4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text("YOUR NOTE", cardX + padX, ry, { charSpace: 0.9 });
    ry += 4.2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    doc.setTextColor(...INK);
    noteLines.forEach((ln) => {
      doc.text(ln, cardX + padX, ry);
      ry += 4.3;
    });
  }

  y += cardH;

  /* ----------------------------- good to know ----------------------------- */

  y += 6.5;
  const gkH = 24.5;
  doc.setFillColor(...CARD);
  doc.roundedRect(M, y, CW, gkH, 2.5, 2.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text("GOOD TO KNOW", M + padX, y + 7, { charSpace: 1.1 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.8);
  doc.setTextColor(...INK);
  const tips = [
    "Please arrive 10 minutes before your appointment time.",
    "Clinic hours: every day, 5:00 PM – 12:00 AM.",
    `Need to reschedule? Call us on ${CLINIC.phone}.`,
  ];
  tips.forEach((tip, i) => {
    const ty = y + 13.2 + i * 4.9;
    doc.setTextColor(...BLUE);
    doc.text("•", M + padX, ty);
    doc.setTextColor(...INK);
    doc.text(tip, M + padX + 3.4, ty);
  });

  /* --------------------------- signature + footer ------------------------- */

  const sigY = 252; // hairline above signatures
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(M, sigY, W - M, sigY);

  // left — clinic contact block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text(CLINIC.name, M, sigY + 9.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text(CLINIC.address, M, sigY + 14.6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...BLUE);
  doc.text(CLINIC.phone, M, sigY + 19.8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text("Open every day, 5:00 PM – 12:00 AM", M, sigY + 24.2);

  // right — doctor signature block
  const sigLineW = 52;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(W - M - sigLineW, sigY + 7.5, W - M, sigY + 7.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text(CLINIC.doctor, W - M, sigY + 13.5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text(`${CLINIC.qualifications}  ·  Dental Surgeon`, W - M, sigY + 18.2, {
    align: "right",
  });

  // bottom band
  doc.setFillColor(...BLUE);
  doc.rect(0, 279.5, W, 297 - 279.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  doc.text(
    `Thank you for choosing ${CLINIC.name} — we look forward to your smile!`,
    CX,
    286.6,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(...WHITE);
  doc.text(
    `${CLINIC.address}      •      ${CLINIC.phone}      •      Open daily 5:00 PM – 12:00 AM`,
    CX,
    292,
    { align: "center" }
  );

  return doc;
}

/* ----------------------------- download API ----------------------------- */

/** Generates the receipt and triggers the browser download. */
export async function downloadReceiptPdf(data: ReceiptData): Promise<void> {
  const doc = await buildReceiptPdf(data);
  doc.save(receiptFileName(data.tokenNumber));
}
