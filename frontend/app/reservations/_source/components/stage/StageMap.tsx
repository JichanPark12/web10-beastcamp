import { useEffect, useState } from "react";
import { useReservation } from "../../contexts/ReservationProvider";
import AreaSeats from "./AreaSeats";
import { gradeInfoColor } from "../../data/seat";

export default function StageMap() {
  const { venue, handleSelectArea, isShowArea, blockGrades, selectedSeats } =
    useReservation();
  console.log(selectedSeats);
  const blockMapUrl = venue?.blockMapUrl;

  const [svgContent, setSvgContent] = useState<string | null>(null);

  useEffect(() => {
    if (!blockMapUrl) return;
    const fetchSvg = async () => {
      try {
        const response = await fetch(blockMapUrl); // 일단 public에 넣어둔 상태라 api mock하면 에러남 고로 api.get 대신 fetch사용
        const text = await response.text();
        setSvgContent(text);
      } catch (err) {
        console.error("svg로딩에러", err);
      }
    };
    fetchSvg();
  }, [blockMapUrl]);

  const blockColorMap = (() => {
    if (!venue?.blocks || !blockGrades) return {};

    const map: Record<string, string> = {};

    venue.blocks.forEach((block) => {
      const grade = blockGrades.find((bg) => bg.blockId === block.id);
      if (grade) {
        const gradeKey = String(grade.gradeId) as keyof typeof gradeInfoColor;
        const color = gradeInfoColor[gradeKey]?.fillColor;
        if (color) {
          map[block.blockDataName] = color;
        }
      }
    });

    return map;
  })();

  const dynamicStyles = Object.entries(blockColorMap)
    .map(
      ([name, color]) => `
        [data-block-name="${name}"] { fill: ${color} !important; transition: opacity 0.2s; } 
        [data-block-name="${name}"]:hover { cursor: pointer; }
      `
    )
    .join("\n");

  return (
    <div className="relative h-full w-full bg-[#EDEFF3] rounded-lg overflow-hidden flex items-center justify-center">
      <div className="relative h-full w-full flex items-center justify-center">
        {isShowArea ? (
          <AreaSeats />
        ) : (
          <div className="relative w-127.5 h-108.75">
            <>
              <style>{dynamicStyles}</style>
              <div
                className="w-full h-full [&>svg]:w-full [&>svg]:h-full select-none pointer-events-auto"
                dangerouslySetInnerHTML={{
                  __html: svgContent ? svgContent : "",
                }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  const blockElement = target.closest("[data-block-name]");
                  const blockName =
                    blockElement?.getAttribute("data-block-name");

                  if (blockName) {
                    const block = venue?.blocks.find(
                      (b) => b.blockDataName === blockName
                    );
                    if (block) {
                      handleSelectArea(String(block.id));
                    }
                  }
                }}
              />
            </>
          </div>
        )}
      </div>
    </div>
  );
}
