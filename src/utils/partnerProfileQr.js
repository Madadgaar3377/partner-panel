/**
 * Simple Madadgaar partner-profile QR card.
 * Partner logo + bold name + QR + public URL footer.
 * Returns a PNG data URL for preview/download.
 */

const RED = "#B7242A";
const INK = "#161618";
const MUTED = "#5C5C66";
const PAPER = "#FFFFFF";

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

function fitText(ctx, text, maxWidth, maxChars = 48) {
  let t = String(text || "").trim();
  if (!t) return "";
  if (t.length > maxChars) t = `${t.slice(0, maxChars - 1)}…`;
  while (t.length > 4 && ctx.measureText(t).width > maxWidth) {
    t = `${t.slice(0, -2)}…`;
  }
  return t;
}

function drawWrappedBold(ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return y;
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
    if (ctx.measureText(last).width > maxWidth || words.join(" ").length > last.length) {
      let trimmed = last;
      while (trimmed.length > 3 && ctx.measureText(`${trimmed}…`).width > maxWidth) {
        trimmed = trimmed.slice(0, -1);
      }
      lines[maxLines - 1] = `${trimmed}…`;
    }
  }
  lines.forEach((ln, i) => {
    ctx.fillText(ln, x, y + i * lineHeight);
  });
  return y + (lines.length - 1) * lineHeight;
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
    userId = "",
    isVerified = true,
  } = opts;

  const QRCode = (await import("qrcode")).default;

  const W = 900;
  const H = 1200;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const displayName =
    String(companyName || partnerName || "Partner").trim() || "Partner";
  const pathLabel = userId
    ? `madadgaar.com.pk/partner/${userId}`
    : String(publicUrl || "")
        .replace(/^https?:\/\//i, "")
        .replace(/\/$/, "");

  // Flat white card background
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  // Flat solid red header (no glare / orbs)
  const headerH = 160;
  ctx.fillStyle = RED;
  ctx.fillRect(0, 0, W, headerH);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "800 40px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText("MADADGAAR", W / 2, 72);

  ctx.font = "600 20px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText("Partner Profile", W / 2, 112);

  // Partner logo — large square, clearly visible
  const logoSize = 168;
  const logoX = (W - logoSize) / 2;
  const logoY = headerH + 48;

  ctx.save();
  roundRect(ctx, logoX - 6, logoY - 6, logoSize + 12, logoSize + 12, 28);
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.1)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, logoX, logoY, logoSize, logoSize, 22);
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
    ctx.font = "800 72px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(displayName.charAt(0).toUpperCase(), W / 2, logoY + logoSize / 2);
    ctx.textBaseline = "alphabetic";
  }
  ctx.restore();

  // Border around logo
  ctx.save();
  roundRect(ctx, logoX, logoY, logoSize, logoSize, 22);
  ctx.strokeStyle = "rgba(183,36,42,0.25)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // Company name — bold and large
  let y = logoY + logoSize + 56;
  ctx.textAlign = "center";
  ctx.fillStyle = INK;
  ctx.font = "800 44px system-ui, -apple-system, Segoe UI, sans-serif";
  y = drawWrappedBold(ctx, displayName, W / 2, y, W - 100, 52, 2);
  y += 36;

  if (isVerified || partnerType) {
    const bits = [];
    if (isVerified) bits.push("Verified Partner");
    if (partnerType) bits.push(partnerType);
    ctx.fillStyle = MUTED;
    ctx.font = "600 18px system-ui, sans-serif";
    ctx.fillText(fitText(ctx, bits.join("  ·  "), W - 120, 56), W / 2, y);
    y += 28;
  }

  // QR code
  const qrSize = 380;
  const qrX = (W - qrSize) / 2;
  const qrY = y + 20;

  ctx.save();
  roundRect(ctx, qrX - 18, qrY - 18, qrSize + 36, qrSize + 36, 24);
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "rgba(22,22,24,0.1)";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  const qrRaw = await QRCode.toDataURL(publicUrl, {
    width: 720,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: INK, light: "#ffffff" },
  });
  const qrImg = await loadImage(qrRaw, { crossOrigin: false });
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  // Footer
  const footerY = qrY + qrSize + 48;
  ctx.textAlign = "center";
  ctx.fillStyle = RED;
  ctx.font = "700 22px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText("Trusted with Madadgaar", W / 2, footerY);

  ctx.fillStyle = INK;
  ctx.font = "700 20px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText(fitText(ctx, pathLabel, W - 80, 64), W / 2, footerY + 40);

  ctx.fillStyle = MUTED;
  ctx.font = "500 16px system-ui, sans-serif";
  ctx.fillText("Scan to open this partner profile", W / 2, footerY + 72);

  // Bottom accent bar — solid red
  ctx.fillStyle = RED;
  ctx.fillRect(0, H - 16, W, 16);

  return canvas.toDataURL("image/png");
}
