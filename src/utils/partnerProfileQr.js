/**
 * Draw a professional Madadgaar partner-profile QR card.
 * Returns a PNG data URL suitable for download/print.
 */

const RED = "#B7242A";
const RED_DEEP = "#8F1C22";
const INK = "#161618";
const MUTED = "#6B6B75";
const PAPER = "#F7F5F3";

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

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function fitText(ctx, text, maxWidth, maxChars = 40) {
  let t = String(text || "").trim();
  if (!t) return "";
  if (t.length > maxChars) t = `${t.slice(0, maxChars - 1)}…`;
  while (t.length > 4 && ctx.measureText(t).width > maxWidth) {
    t = `${t.slice(0, -2)}…`;
  }
  return t;
}

/**
 * @param {{
 *   publicUrl: string,
 *   companyName: string,
 *   partnerName?: string,
 *   partnerType?: string,
 *   profilePic?: string,
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

  // High-res canvas for crisp print / social share
  const W = 900;
  const H = 1180;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Soft paper background
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  // Subtle diagonal texture
  ctx.save();
  ctx.strokeStyle = "rgba(22,22,24,0.035)";
  ctx.lineWidth = 1;
  for (let i = -H; i < W + H; i += 28) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + H, H);
    ctx.stroke();
  }
  ctx.restore();

  // Outer card
  const cardX = 48;
  const cardY = 48;
  const cardW = W - 96;
  const cardH = H - 96;
  ctx.save();
  roundRect(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(183,36,42,0.12)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 12;
  ctx.fill();
  ctx.restore();

  // Red header band
  ctx.save();
  roundRect(ctx, cardX, cardY, cardW, 220, 36);
  ctx.clip();
  const headerGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + 220);
  headerGrad.addColorStop(0, RED);
  headerGrad.addColorStop(0.55, RED_DEEP);
  headerGrad.addColorStop(1, "#5C1218");
  ctx.fillStyle = headerGrad;
  ctx.fillRect(cardX, cardY, cardW, 220);

  // Soft highlight orb
  const orb = ctx.createRadialGradient(
    cardX + cardW * 0.82,
    cardY + 40,
    10,
    cardX + cardW * 0.82,
    cardY + 40,
    180
  );
  orb.addColorStop(0, "rgba(255,200,180,0.35)");
  orb.addColorStop(1, "rgba(255,200,180,0)");
  ctx.fillStyle = orb;
  ctx.fillRect(cardX, cardY, cardW, 220);

  // Cover bottom radius of header (square off bottom)
  ctx.fillStyle = headerGrad;
  ctx.fillRect(cardX, cardY + 180, cardW, 40);
  ctx.restore();

  // Brand wordmark
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "800 42px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText("MADADGAAR", W / 2, cardY + 72);

  ctx.font = "600 18px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.fillText("PARTNER PROFILE", W / 2, cardY + 108);

  // Accent line under title
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 48, cardY + 128);
  ctx.lineTo(W / 2 + 48, cardY + 128);
  ctx.stroke();

  ctx.font = "500 16px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.fillText("Scan to open storefront", W / 2, cardY + 162);

  // Partner avatar overlapping header / body
  const avatarSize = 112;
  const avatarX = W / 2 - avatarSize / 2;
  const avatarY = cardY + 188;
  ctx.save();
  ctx.beginPath();
  ctx.arc(W / 2, avatarY + avatarSize / 2, avatarSize / 2 + 6, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(W / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  let drewAvatar = false;
  if (profilePic) {
    try {
      const pic = await loadImage(profilePic);
      // Cover-fit
      const scale = Math.max(avatarSize / pic.width, avatarSize / pic.height);
      const dw = pic.width * scale;
      const dh = pic.height * scale;
      ctx.drawImage(pic, W / 2 - dw / 2, avatarY + avatarSize / 2 - dh / 2, dw, dh);
      drewAvatar = true;
    } catch {
      /* fall through */
    }
  }
  if (!drewAvatar) {
    const g = ctx.createLinearGradient(avatarX, avatarY, avatarX + avatarSize, avatarY + avatarSize);
    g.addColorStop(0, RED);
    g.addColorStop(1, RED_DEEP);
    ctx.fillStyle = g;
    ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 48px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      String(companyName || "P").charAt(0).toUpperCase(),
      W / 2,
      avatarY + avatarSize / 2
    );
    ctx.textBaseline = "alphabetic";
  }
  ctx.restore();

  // Company name + meta
  const nameY = avatarY + avatarSize + 48;
  ctx.textAlign = "center";
  ctx.fillStyle = INK;
  ctx.font = "800 34px system-ui, -apple-system, Segoe UI, sans-serif";
  const title = fitText(ctx, companyName || "Partner", cardW - 80, 34);
  ctx.fillText(title, W / 2, nameY);

  let metaY = nameY + 34;
  const metaBits = [];
  if (isVerified) metaBits.push("Verified partner");
  if (partnerType) metaBits.push(partnerType);
  if (partnerName && partnerName !== companyName) metaBits.push(partnerName);
  if (metaBits.length) {
    ctx.fillStyle = MUTED;
    ctx.font = "500 16px system-ui, sans-serif";
    ctx.fillText(fitText(ctx, metaBits.join("  ·  "), cardW - 100, 52), W / 2, metaY);
    metaY += 18;
  }

  // QR panel
  const qrPanelSize = 420;
  const qrPanelX = (W - qrPanelSize) / 2;
  const qrPanelY = metaY + 28;

  ctx.save();
  roundRect(ctx, qrPanelX, qrPanelY, qrPanelSize, qrPanelSize, 28);
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(22,22,24,0.08)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fill();
  ctx.restore();

  // Soft red ring around QR panel
  ctx.save();
  roundRect(ctx, qrPanelX, qrPanelY, qrPanelSize, qrPanelSize, 28);
  ctx.strokeStyle = "rgba(183,36,42,0.18)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  const qrRaw = await QRCode.toDataURL(publicUrl, {
    width: 720,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: INK, light: "#ffffff" },
  });
  const qrImg = await loadImage(qrRaw);
  const qrPad = 36;
  const qrDraw = qrPanelSize - qrPad * 2;
  ctx.drawImage(qrImg, qrPanelX + qrPad, qrPanelY + qrPad, qrDraw, qrDraw);

  // Center logo badge on QR
  const badge = 78;
  const bx = W / 2 - badge / 2;
  const by = qrPanelY + qrPanelSize / 2 - badge / 2;
  ctx.save();
  roundRect(ctx, bx, by, badge, badge, 18);
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.12)";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, bx, by, badge, badge, 18);
  ctx.strokeStyle = "rgba(183,36,42,0.2)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  let logoOk = false;
  try {
    const logo = await loadImage("/madadgaar-logo.jpg");
    const inset = 10;
    ctx.save();
    roundRect(ctx, bx + inset, by + inset, badge - inset * 2, badge - inset * 2, 12);
    ctx.clip();
    ctx.drawImage(logo, bx + inset, by + inset, badge - inset * 2, badge - inset * 2);
    ctx.restore();
    logoOk = true;
  } catch {
    /* fallback monogram */
  }
  if (!logoOk) {
    ctx.fillStyle = RED;
    ctx.font = "800 28px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("M", W / 2, by + badge / 2);
    ctx.textBaseline = "alphabetic";
  }

  // Footer zone
  const footerTop = qrPanelY + qrPanelSize + 40;
  ctx.textAlign = "center";
  ctx.fillStyle = MUTED;
  ctx.font = "500 15px system-ui, sans-serif";
  ctx.fillText("madadgaar.com.pk", W / 2, footerTop);

  ctx.fillStyle = INK;
  ctx.font = "600 14px ui-monospace, SFMono-Regular, Menlo, monospace";
  const shortUrl = String(publicUrl || "")
    .replace(/^https?:\/\//, "")
    .slice(0, 46);
  ctx.fillText(fitText(ctx, shortUrl, cardW - 100, 48), W / 2, footerTop + 28);

  // Bottom accent strip (clipped to card radius)
  ctx.save();
  roundRect(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.clip();
  const footGrad = ctx.createLinearGradient(cardX, 0, cardX + cardW, 0);
  footGrad.addColorStop(0, RED);
  footGrad.addColorStop(1, RED_DEEP);
  ctx.fillStyle = footGrad;
  ctx.fillRect(cardX, cardY + cardH - 18, cardW, 18);
  ctx.restore();

  // Outer fine border
  ctx.save();
  roundRect(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.strokeStyle = "rgba(183,36,42,0.22)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  return canvas.toDataURL("image/png");
}
