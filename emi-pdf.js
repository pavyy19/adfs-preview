// AD Financial Services — EMI computation as an A4 PDF on the firm letterhead (jsPDF + AutoTable, vector text).
// Usage: import('./emi-pdf.js').then(m => m.downloadEmiPdf({ P, R, N, name, mobile, email }))
const LIBS = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
];
const FIRM = {
  name: 'AD Financial Services',
  line: 'Loan Advisory & Facilitation',
  addr: ['Office No. 1, 2 & 3, Near Wale Hospital, Navrang Chowk,', 'Mangalwedha, Dist. Solapur, Maharashtra 413305'],
  contact: '+91 98608 34230  |  ajaydange084@gmail.com  |  www.adfsconnect.in',
  advisor: 'Mr. Ajay Dange, Finance Advisor'
};
const NAVY = [10, 35, 71], BLUE = [0, 75, 142], RED = [211, 34, 42], MUTED = [96, 108, 124], LINE = [214, 219, 228], PAPER = [246, 244, 239];

function load(src) {
  return new Promise((ok, bad) => {
    if ([...document.scripts].some((s) => s.src === src)) return ok();
    const s = document.createElement('script');
    s.src = src; s.async = true; s.crossOrigin = 'anonymous';
    s.onload = ok; s.onerror = () => bad(new Error('Could not load ' + src));
    document.head.appendChild(s);
  });
}
async function libs() {
  if (!(window.jspdf && window.jspdf.jsPDF)) await load(LIBS[0]);
  if (!window.jspdf.jsPDF.API.autoTable) await load(LIBS[1]);
  return window.jspdf.jsPDF;
}
async function logoData() {
  const r = await fetch(new URL('assets/logo.jpg', location.href).href, { cache: 'force-cache' });
  const b = await r.blob();
  return new Promise((ok, bad) => { const f = new FileReader(); f.onload = () => ok(f.result); f.onerror = bad; f.readAsDataURL(b); });
}
const rs = (v) => 'Rs. ' + Math.round(v).toLocaleString('en-IN');
const n0 = (v) => Math.round(v).toLocaleString('en-IN');
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const mLabel = (start, k) => { const [Y, M] = String(start).split('-').map(Number); const n = (M - 1) + (k - 1); return MON[n % 12] + ' ' + (Y + Math.floor(n / 12)); };
const tenWords = (N) => { const y = Math.floor(N / 12), m = N % 12; return (y ? y + (y === 1 ? ' year' : ' years') : '') + (y && m ? ' ' : '') + (m ? m + (m === 1 ? ' month' : ' months') : ''); };
const emiOf = (P, R, n) => { const r = R / 1200; if (!r) return P / n; const k = Math.pow(1 + r, n); return (P * r * k) / (k - 1); };

export function schedule(P, R, N) {
  const E = emiOf(P, R, N), r = R / 1200, years = [], months = [];
  let bal = P;
  for (let m = 1; m <= N; m++) {
    const i = bal * r, p = Math.min(bal, E - i);
    bal = Math.max(0, bal - p);
    months.push({ m, p, i, bal });
    const y = Math.ceil(m / 12);
    if (!years[y - 1]) years[y - 1] = { y, pp: 0, ip: 0, close: 0 };
    years[y - 1].pp += p; years[y - 1].ip += i; years[y - 1].close = bal;
  }
  return { E, total: E * N, interest: E * N - P, years, months };
}

export async function downloadEmiPdf(o) {
  const jsPDF = await libs();
  const logo = await logoData().catch(() => null);
  const { P, R, N } = o;
  const start = /^\d{4}-\d{2}$/.test(o.start || '') ? o.start : (() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); })();
  const s = schedule(P, R, N);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, M = 16;
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const fyNow = (today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1);
  const ref = /^ADFS\/EMI\//.test(o.ref || '') ? o.ref : 'ADFS/EMI/' + fyNow + '-' + String((fyNow + 1) % 100).padStart(2, '0') + '/001';

  // shrink a single line until it fits the given width (never runs past the margin)
  const fitText = (str, x, yy, maxW, align) => {
    let fs = doc.getFontSize();
    while (doc.getTextWidth(str) > maxW && fs > 6) { fs -= .2; doc.setFontSize(fs); }
    doc.text(str, x, yy, align ? { align } : undefined);
  };
  const stamp = today.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const letterhead = () => {
    // logo exactly as supplied, at its own proportions (1250 x 481)
    if (logo) doc.addImage(logo, 'JPEG', M, 10, 52, 52 * 481 / 1250);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor(...NAVY);
    doc.text(FIRM.name, W - M, 15, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.2); doc.setTextColor(...RED);
    doc.text(FIRM.line.toUpperCase(), W - M, 19.5, { align: 'right' });
    doc.setTextColor(...MUTED); doc.setFontSize(8.2);
    fitText(FIRM.addr[0], W - M, 24.5, 118, 'right');
    fitText(FIRM.addr[1], W - M, 28.5, 118, 'right');
    fitText(FIRM.contact, W - M, 32.5, 118, 'right');
    doc.setDrawColor(...BLUE); doc.setLineWidth(.9); doc.line(M, 37, W - M, 37);
    doc.setDrawColor(...RED); doc.setLineWidth(.35); doc.line(M, 38.4, W - M, 38.4);
  };
  const footer = (page, pages) => {
    doc.setDrawColor(...BLUE); doc.setLineWidth(.4); doc.line(M, 280.5, W - M, 280.5);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.4); doc.setTextColor(...NAVY);
    doc.text(FIRM.name, M, 284.5);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...MUTED);
    doc.text('Page ' + page + ' of ' + pages, W - M, 284.5, { align: 'right' });
    doc.setFontSize(7);
    fitText('System-generated computation from the EMI Calculator at www.adfsconnect.in on ' + stamp + '. No signature is required.', M, 288.6, W - 2 * M);
  };

  letterhead();
  // title block
  doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.setTextColor(...NAVY);
  doc.text('EMI Computation', M, 49.5);
  doc.setFillColor(238, 243, 250); doc.setDrawColor(...BLUE); doc.setLineWidth(.25);
  doc.roundedRect(M + 58, 44.6, 42, 6.4, 3.2, 3.2, 'FD');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(6.8); doc.setTextColor(...BLUE);
  doc.text('SYSTEM GENERATED', M + 79, 48.8, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.6); doc.setTextColor(...MUTED);
  doc.text('Date: ' + dateStr, W - M, 45.5, { align: 'right' });
  doc.text('Ref: ' + ref, W - M, 50, { align: 'right' });
  let y = 57;
  if (o.name) {
    doc.setFontSize(9.2); doc.setTextColor(...NAVY);
    const who = doc.splitTextToSize('Prepared for: ' + o.name + (o.mobile ? '   |   Mobile: +91 ' + o.mobile : '') + (o.email ? '   |   ' + o.email : ''), W - 2 * M);
    doc.text(who, M, y);
    y += who.length * 4.4 + 2;
  }

  // summary: three rounded tiles + detail box
  const tiles = [['Monthly EMI', rs(s.E)], ['Total interest', rs(s.interest)], ['Total payable', rs(s.total)]];
  const tw = (W - 2 * M - 8) / 3;
  tiles.forEach((t, i) => {
    const x = M + i * (tw + 4);
    doc.setFillColor(...(i === 0 ? NAVY : PAPER)); doc.setDrawColor(...(i === 0 ? NAVY : LINE));
    doc.roundedRect(x, y, tw, 19, 3, 3, 'FD');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.6); doc.setTextColor(...(i === 0 ? [191, 214, 245] : MUTED));
    doc.text(t[0].toUpperCase(), x + 5, y + 6.2, { charSpace: .3 });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(...(i === 0 ? [255, 255, 255] : NAVY));
    fitText(t[1], x + 5, y + 14.6, tw - 10);
  });
  y += 23;
  doc.autoTable({
    startY: y, margin: { left: M, right: M }, theme: 'plain',
    body: [
      ['Loan amount', rs(P), 'Interest rate', R.toFixed(2) + '% per annum'],
      ['Tenure', N + ' months' + (N >= 12 ? ' (' + tenWords(N) + ')' : ''), 'Interest share of total', Math.round(s.interest / s.total * 100) + '%'],
      ['EMI period', mLabel(start, 1) + ' to ' + mLabel(start, N), 'Method', 'Reducing balance, monthly rests']
    ],
    styles: { font: 'helvetica', fontSize: 9, textColor: NAVY, cellPadding: { top: 1.8, bottom: 1.8, left: 3, right: 3 }, lineColor: LINE, lineWidth: { bottom: .2 } },
    columnStyles: { 0: { textColor: MUTED, cellWidth: 30 }, 1: { fontStyle: 'bold', cellWidth: 59 }, 2: { textColor: MUTED, cellWidth: 36 }, 3: { fontStyle: 'bold', cellWidth: 53 } }
  });
  y = doc.lastAutoTable.finalY + 7;

  // month-by-month schedule: one regular table, continued page to page with the letterhead and column titles
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(...NAVY);
  doc.text('Month-by-month repayment schedule', M, y);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.6); doc.setTextColor(...MUTED);
  doc.text('Amounts in Rs.  |  shading changes every financial year (April to March)', W - M, y, { align: 'right' });
  doc.autoTable({
    startY: y + 2.5, margin: { left: M, right: M, top: 46, bottom: 22 }, theme: 'grid', showHead: 'everyPage',
    head: [['No.', 'Month', 'Opening balance', 'EMI', 'Principal', 'Interest', 'Closing balance']],
    body: s.months.map((r) => [String(r.m), mLabel(start, r.m), n0(r.bal + r.p), n0(s.E), n0(r.p), n0(r.i), n0(r.bal)]),
    styles: { font: 'helvetica', fontSize: 7.6, textColor: NAVY, lineColor: LINE, lineWidth: .15, cellPadding: { top: .9, bottom: .9, left: 2, right: 2 }, halign: 'right' },
    headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'right' },
    columnStyles: { 0: { halign: 'center', cellWidth: 12 }, 1: { halign: 'left', cellWidth: 24 }, 2: { cellWidth: 30 }, 3: { cellWidth: 26 }, 4: { cellWidth: 27 }, 5: { cellWidth: 27 }, 6: { cellWidth: 32 } },
    tableWidth: W - 2 * M,
    didParseCell: (d) => {
      if (d.section === 'head' && d.column.index === 1) d.cell.styles.halign = 'left';
      if (d.section !== 'body') return;
      const m = s.months[d.row.index].m;
      // financial year (Apr–Mar) of this instalment's calendar month decides the shading; April rows are marked
      const [SY, SM] = start.split('-').map(Number), idx0 = (SM - 1) + (m - 1), cm = idx0 % 12, cy = SY + Math.floor(idx0 / 12);
      const fy = cm >= 3 ? cy : cy - 1;
      d.cell.styles.fillColor = fy % 2 ? [255, 255, 255] : [240, 244, 250];
      // March (end of every financial year) in bold, whole row
      if (cm === 2) { d.cell.styles.fontStyle = 'bold'; if (d.column.index <= 1) d.cell.styles.textColor = BLUE; }
    },
    didDrawPage: () => { if (doc.internal.getCurrentPageInfo().pageNumber > 1) letterhead(); }
  });
  y = doc.lastAutoTable.finalY + 5;
  // totals line
  doc.setFillColor(...PAPER); doc.setDrawColor(...LINE); doc.setLineWidth(.2);
  doc.roundedRect(M, y, W - 2 * M, 8, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...NAVY);
  fitText('Total over ' + N + ' months:   EMIs paid ' + rs(s.total) + '   |   Principal ' + rs(P) + '   |   Interest ' + rs(s.interest), M + 4, y + 5.3, W - 2 * M - 8);
  y += 14;
  if (y > 232) { doc.addPage(); letterhead(); y = 48; }

  const notes = [
    'This computation is an estimate for illustration only, using the standard reducing-balance formula with monthly rests.',
    'The actual EMI, interest and schedule depend on the lender\'s rate, processing fees, insurance, rounding, the disbursement date and the first EMI date. The terms in the lender\'s sanction letter and loan agreement are final.',
    'AD Financial Services is a loan advisory and facilitation firm and is not a bank, NBFC or lender. Sanction of any loan is at the sole discretion of the lender.',
    'We never ask for OTPs, PINs or any payment into a personal account to process a loan.',
    'This is a system-generated document created from the details entered on www.adfsconnect.in. It does not require a signature and is not an offer or sanction of a loan.'
  ];
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(...NAVY);
  doc.text('Notes', M, y);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.8); doc.setTextColor(...MUTED);
  y += 4.2;
  notes.forEach((n, i) => {
    const lines = doc.splitTextToSize(n, W - 2 * M - 5);
    doc.text((i + 1) + '.', M, y);
    doc.text(lines, M + 5, y);
    y += lines.length * 3.4 + 1.1;
  });
  y += 3;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.8); doc.setTextColor(...NAVY);
  doc.text(doc.splitTextToSize('For a rate check and lender options for your profile, call +91 98608 34230 or WhatsApp the same number.', W - 2 * M), M, y);

  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) { doc.setPage(i); footer(i, pages); }
  const fname = 'ADFS EMI Computation - ' + (o.name ? o.name.replace(/[\\/:*?"<>|]+/g, '').trim() + ' - ' : '') + dateStr + '.pdf';
  doc.save(fname);
  return { file: fname, emi: Math.round(s.E), interest: Math.round(s.interest), total: Math.round(s.total) };
}
