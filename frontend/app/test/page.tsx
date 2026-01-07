import fs from "fs";
import A from "./A";

const seatHtml = fs.readFileSync("./app/test/data.html", "utf-8");
export const venueSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 620" width="800" height="620">
  <rect x="250" y="20" width="300" height="60" rx="8" fill="#b8c5d6" stroke="#6b7a8f" stroke-width="2"/>
  <text x="400" y="58" text-anchor="middle" font-size="20" font-weight="bold" fill="#3d4b5c">STAGE</text>
  
  <text x="50" y="150" font-size="14" font-weight="bold" fill="#666">1F</text>
  
  <text x="160" y="125" text-anchor="middle" font-size="11" fill="#888">R-Left</text>
  ${generateSeatCircles("1F-RL", 100, 140, 5, 6, 22, 22)}
  
  <text x="400" y="125" text-anchor="middle" font-size="11" fill="#888">VIP</text>
  ${generateSeatCircles("1F-VIP", 260, 140, 5, 14, 22, 22)}
  
  <text x="640" y="125" text-anchor="middle" font-size="11" fill="#888">R-Right</text>
  ${generateSeatCircles("1F-RR", 580, 140, 5, 6, 22, 22)}
  
  <text x="50" y="340" font-size="14" font-weight="bold" fill="#666">2F</text>
  
  <text x="160" y="315" text-anchor="middle" font-size="11" fill="#888">S-Left</text>
  ${generateSeatCircles("2F-SL", 100, 330, 5, 6, 22, 22)}
  
  <text x="400" y="315" text-anchor="middle" font-size="11" fill="#888">A-Center</text>
  ${generateSeatCircles("2F-AC", 280, 330, 5, 12, 22, 22)}
  
  <text x="640" y="315" text-anchor="middle" font-size="11" fill="#888">S-Right</text>
  ${generateSeatCircles("2F-SR", 580, 330, 5, 6, 22, 22)}
  
  <text x="400" y="480" text-anchor="middle" font-size="12" fill="#888">일반석 (General)</text>
  ${generateSeatCircles("GN", 200, 500, 4, 20, 20, 20)}
</svg>
`;

function generateSeatCircles(
  sectionId: string,
  startX: number,
  startY: number,
  rows: number,
  cols: number,
  spacingX: number,
  spacingY: number
): string {
  let circles = "";
  // 반지름을 8에서 6으로 줄여서 간격 가독성을 높임
  const radius = 6;
  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= cols; col++) {
      const cx = startX + (col - 1) * spacingX;
      const cy = startY + (row - 1) * spacingY;
      const seatId = `${sectionId}-${row}-${col}`;
      circles += `  <circle data-seat-location="${seatId}" cx="${cx}" cy="${cy}" r="${radius}" fill="#cccccc" stroke="#333" stroke-width="0.5" style="cursor: pointer;"/>\n`;
    }
  }
  return circles;
}
export default function page() {
  console.log(venueSVG);
  console.log("왜이래ㅣ");
  return (
    <div>
      <A seatHtml={seatHtml} />
      <img src="./test.svg" alt="Venue Seating Chart" />
    </div>
  );
}
