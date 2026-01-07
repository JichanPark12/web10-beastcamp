"use client";

export default function A({ seatHtml }) {
  const parser = new DOMParser();

  const doc = parser.parseFromString(seatHtml, "text/html");

  const seatBox = doc.querySelector("#divSeatBox");

  const result = [];
  let currentRow = null;

  seatBox.querySelectorAll("span").forEach((span, idx) => {
    if (span.classList.contains("SeatT")) {
      if (currentRow) result.push(currentRow);

      const text = span.textContent.trim();
      const [, area, row] = text.match(/(\d+구역)\s+(\d+)열/);

      currentRow = {
        area,
        row: Number(row),
        seats: [],
      };
    }

    if (span.classList.contains("SeatR") && currentRow) {
      currentRow.seats.push({
        id: currentRow.area.match(/\d+/)[0] + currentRow.row + idx,
      });
    }
  });

  if (currentRow) result.push(currentRow);

  console.log(result);
  return <div>A</div>;
}
