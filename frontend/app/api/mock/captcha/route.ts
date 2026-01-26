import { NextResponse } from "next/server";

// 간단한 6자리 보안 문자 생성
function generateCaptchaText(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 헷갈리는 문자 제외 (I, O, 0, 1)
  let text = "";
  for (let i = 0; i < 6; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}

// SVG 보안 문자 이미지 생성
function generateCaptchaSVG(text: string): string {
  const width = 200;
  const height = 60;
  const fontSize = 32;

  // 랜덤 색상 생성
  const colors = [
    "#1e40af",
    "#be123c",
    "#047857",
    "#c2410c",
    "#7c2d12",
    "#4c1d95",
  ];

  // 각 글자를 랜덤하게 배치
  const letters = text.split("").map((char, i) => {
    const x = 20 + i * 28 + Math.random() * 10;
    const y = 40 + Math.random() * 10 - 5;
    const rotation = Math.random() * 30 - 15;
    const color = colors[Math.floor(Math.random() * colors.length)];

    return `<text x="${x}" y="${y}" font-size="${fontSize}" font-weight="bold" fill="${color}" transform="rotate(${rotation} ${x} ${y})">${char}</text>`;
  });

  // 노이즈 라인 추가
  const lines = Array.from({ length: 5 }, () => {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    const color = colors[Math.floor(Math.random() * colors.length)];
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1" opacity="0.3"/>`;
  });

  // 노이즈 점 추가
  const dots = Array.from({ length: 30 }, () => {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const color = colors[Math.floor(Math.random() * colors.length)];
    return `<circle cx="${cx}" cy="${cy}" r="1.5" fill="${color}" opacity="0.4"/>`;
  });

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#f3f4f6"/>
  ${lines.join("\n  ")}
  ${dots.join("\n  ")}
  ${letters.join("\n  ")}
</svg>
  `.trim();
}

// 메모리에 저장된 보안 문자 (실제로는 Redis 등을 사용해야 함)
const captchaStore = new Map<string, { text: string; createdAt: number }>();

// 5분마다 만료된 보안 문자 삭제
const CAPTCHA_EXPIRY = 5 * 60 * 1000; // 5분
setInterval(() => {
  const now = Date.now();
  for (const [id, data] of captchaStore.entries()) {
    if (now - data.createdAt > CAPTCHA_EXPIRY) {
      captchaStore.delete(id);
    }
  }
}, 60 * 1000);

export function GET() {
  const captchaText = generateCaptchaText();
  const captchaId = `captcha-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // 보안 문자 저장
  captchaStore.set(captchaId, {
    text: captchaText,
    createdAt: Date.now(),
  });

  const svgImage = generateCaptchaSVG(captchaText);

  // SVG를 응답으로 반환
  return new NextResponse(svgImage, {
    headers: {
      "Content-Type": "image/svg+xml",
      "X-Captcha-Id": captchaId,
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

// 디버깅용: 생성된 보안 문자 확인 (개발 환경에서만 사용)
export { captchaStore };
