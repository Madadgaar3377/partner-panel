/**
 * Simple Madadgaar partner-profile QR card.
 * Partner logo + bold name (verified tick) + large QR with Madadgaar logo.
 * Returns a PNG data URL for preview/download.
 */

const RED = "#B7242A";
const INK = "#161618";
const MUTED = "#5C5C66";
const GREEN = "#16A34A";
const PAPER = "#FFFFFF";
const MADADGAAR_LOGO = "/madadgaar-logo.jpg";

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function loadImage(src, { crossOrigin = true } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Prefer CORS load; fall back to blob fetch so logo can draw on canvas. */
async function loadImageSafe(src) {
  if (!src) return null;
  try {
    return await loadImage(src, { crossOrigin: true });
  } catch {
    /* try blob route */
  }
  try {
    const res = await fetch(src, { mode: "cors", credentials: "omit" });
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      return await loadImage(objectUrl, { crossOrigin: false });
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    return null;
  }
}

function wrapLines(ctx, text, maxWidth, maxLines = 2) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word;
      if (lines.length >= maxLines) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1];
    const full = words.join(" ");
    if (ctx.measureText(last).width > maxWidth || full.length > last.length) {
      let trimmed = last;
      while (trimmed.length > 3 && ctx.measureText(`${trimmed}…`).width > maxWidth) {
        trimmed = trimmed.slice(0, -1);
      }
      lines[maxLines - 1] = `${trimmed}…`;
    }
  }
  return lines;
}

/** Green verified tick (circle + check) like Madadgaar frontend */
function drawVerifiedTick(ctx, cx, cy, size = 36) {
  const r = size / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = GREEN;
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(3, size * 0.12);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const s = size;
  ctx.moveTo(cx - s * 0.22, cy + s * 0.02);
  ctx.lineTo(cx - s * 0.04, cy + s * 0.2);
  ctx.lineTo(cx + s * 0.24, cy - s * 0.18);
  ctx.stroke();
}

/** Diagonal “MADADGAAR” watermark across the card body */
function drawCardWatermark(ctx, W, H, companyName = "") {
  ctx.save();
  ctx.globalAlpha = 0.055;
  ctx.fillStyle = RED;
  ctx.font = "800 42px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const stepX = 280;
  const stepY = 160;
  ctx.translate(W / 2, H / 2);
  ctx.rotate((-28 * Math.PI) / 180);
  ctx.translate(-W / 2, -H / 2);

  for (let y = -H; y < H * 2; y += stepY) {
    for (let x = -W; x < W * 2; x += stepX) {
      const odd = Math.floor(y / stepY) % 2 !== 0;
      ctx.fillText("MADADGAAR", x + (odd ? stepX / 2 : 0), y);
    }
  }
  ctx.restore();

  // Large faint company-name watermark behind content
  const label = String(companyName || "").trim();
  if (label) {
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = INK;
    ctx.font = "900 120px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.translate(W / 2, H * 0.42);
    ctx.rotate((-18 * Math.PI) / 180);
    ctx.fillText(label.length > 18 ? `${label.slice(0, 17)}…` : label, 0, 0);
    ctx.restore();
  }
}

/**
 * @param {{
 *   publicUrl: string,
 *   companyName: string,
 *   partnerName?: string,
 *   partnerType?: string,
 *   profilePic?: string,
 *   userId?: string,
 *   isVerified?: boolean,
 * }} opts
 */
export async function createPartnerProfileQrCard(opts) {
  const {
    publicUrl,
    companyName,
    partnerName = "",
    partnerType = "",
    profilePic = "",
    isVerified = true,
  } = opts;

  const QRCode = (await import("qrcode")).default;

  const W = 900;
  const H = 1280;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const displayName =
    String(companyName || partnerName || "Partner").trim() || "Partner";

  // Flat white card background + watermark (under content, not over QR)
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  drawCardWatermark(ctx, W, H, displayName);

  // Flat solid red header (covers watermark in header zone)
  const headerH = 140;
  ctx.fillStyle = RED;
  ctx.fillRect(0, 0, W, headerH);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "800 38px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText("MADADGAAR", W / 2, 64);

  ctx.font = "600 18px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText("Partner Profile", W / 2, 100);

  // Partner logo
  const logoSize = 132;
  const logoX = (W - logoSize) / 2;
  const logoY = headerH + 32;

  ctx.save();
  roundRect(ctx, logoX - 4, logoY - 4, logoSize + 8, logoSize + 8, 24);
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.1)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 3;
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, logoX, logoY, logoSize, logoSize, 20);
  ctx.clip();

  const pic = await loadImageSafe(profilePic);
  if (pic) {
    const scale = Math.max(logoSize / pic.width, logoSize / pic.height);
    const dw = pic.width * scale;
    const dh = pic.height * scale;
    ctx.drawImage(
      pic,
      logoX + (logoSize - dw) / 2,
      logoY + (logoSize - dh) / 2,
      dw,
      dh
    );
  } else {
    ctx.fillStyle = RED;
    ctx.fillRect(logoX, logoY, logoSize, logoSize);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 64px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(displayName.charAt(0).toUpperCase(), W / 2, logoY + logoSize / 2);
    ctx.textBaseline = "alphabetic";
  }
  ctx.restore();

  ctx.save();
  roundRect(ctx, logoX, logoY, logoSize, logoSize, 20);
  ctx.strokeStyle = "rgba(183,36,42,0.25)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // Company name — larger / bolder + green verified tick
  let y = logoY + logoSize + 52;
  const tickSize = 48;
  const gap = 16;
  const nameMaxW = W - 90 - (isVerified ? tickSize + gap : 0);

  ctx.font = "900 56px system-ui, -apple-system, Segoe UI, Arial Black, sans-serif";
  ctx.fillStyle = INK;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  const nameLines = wrapLines(ctx, displayName, nameMaxW, 2);
  const lineH = 64;
  const blockW = Math.max(
    ...nameLines.map((ln) => ctx.measureText(ln).width),
    0
  );
  const totalW = blockW + (isVerified ? gap + tickSize : 0);
  const startX = (W - totalW) / 2;

  nameLines.forEach((ln, i) => {
    // Soft shadow so name stays readable over watermark
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillText(ln, startX + 2, y + i * lineH + 2);
    ctx.fillStyle = INK;
    ctx.fillText(ln, startX, y + i * lineH);
  });

  if (isVerified && nameLines.length) {
    const lastIdx = nameLines.length - 1;
    const lastW = ctx.measureText(nameLines[lastIdx]).width;
    const tickCx = startX + lastW + gap + tickSize / 2;
    const tickCy = y + lastIdx * lineH - 18;
    drawVerifiedTick(ctx, tickCx, tickCy, tickSize);
  }

  y += Math.max(nameLines.length, 1) * lineH + 6;

  if (partnerType) {
    ctx.textAlign = "center";
    ctx.fillStyle = MUTED;
    ctx.font = "600 18px system-ui, sans-serif";
    ctx.fillText(partnerType, W / 2, y);
    y += 24;
  }

  // Large QR for easy scan + Madadgaar logo in center
  const qrSize = 520;
  const qrX = (W - qrSize) / 2;
  const qrY = y + 14;

  // Opaque white pad so watermark never sits under the QR scan area
  ctx.save();
  roundRect(ctx, qrX - 14, qrY - 14, qrSize + 28, qrSize + 28, 22);
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "rgba(22,22,24,0.1)";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  const qrRaw = await QRCode.toDataURL(publicUrl, {
    width: 1000,
    margin: 1,
    errorCorrectionLevel: "H",
    color: { dark: INK, light: "#ffffff" },
  });
  const qrImg = await loadImage(qrRaw, { crossOrigin: false });
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  // Madadgaar logo badge centered on QR
  const badge = 96;
  const bx = W / 2 - badge / 2;
  const by = qrY + qrSize / 2 - badge / 2;

  ctx.save();
  roundRect(ctx, bx - 4, by - 4, badge + 8, badge + 8, 20);
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.14)";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, bx, by, badge, badge, 16);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "rgba(183,36,42,0.22)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  const brandLogo = await loadImageSafe(MADADGAAR_LOGO);
  if (brandLogo) {
    const inset = 10;
    ctx.save();
    roundRect(ctx, bx + inset, by + inset, badge - inset * 2, badge - inset * 2, 12);
    ctx.clip();
    const iw = badge - inset * 2;
    const scale = Math.max(iw / brandLogo.width, iw / brandLogo.height);
    const dw = brandLogo.width * scale;
    const dh = brandLogo.height * scale;
    ctx.drawImage(
      brandLogo,
      bx + inset + (iw - dw) / 2,
      by + inset + (iw - dh) / 2,
      dw,
      dh
    );
    ctx.restore();
  } else {
    ctx.fillStyle = RED;
    ctx.font = "800 34px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("M", W / 2, by + badge / 2);
    ctx.textBaseline = "alphabetic";
  }

  // Footer — bold “Trusted with Madadgaar”
  const footerY = qrY + qrSize + 52;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Soft backdrop so it stays readable over watermark
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  roundRect(ctx, 48, footerY - 36, W - 96, 78, 16);
  ctx.fill();

  ctx.fillStyle = RED;
  ctx.font = "900 32px system-ui, -apple-system, Segoe UI, Arial Black, sans-serif";
  ctx.fillText("Trusted with Madadgaar", W / 2, footerY);

  ctx.fillStyle = MUTED;
  ctx.font = "600 16px system-ui, sans-serif";
  ctx.fillText("Scan to open this partner profile", W / 2, footerY + 30);

  // Bottom accent bar
  ctx.fillStyle = RED;
  ctx.fillRect(0, H - 16, W, 16);

  return canvas.toDataURL("image/png");
}
