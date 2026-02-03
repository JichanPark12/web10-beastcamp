import { gradeInfoColor } from "../../data/seat";
import { VenueDetail, BlockGrade } from "@/types/venue";

interface VenueMapProps {
  svgContent: string | null;
  venue: VenueDetail | null;
  blockGrades: BlockGrade[] | undefined;
  onBlockSelect: (blockId: string) => void;
}

export default function VenueMap({
  svgContent,
  venue,
  blockGrades,
  onBlockSelect,
}: VenueMapProps) {
  if (!venue || !blockGrades) return null;
  const dynamicStyles = createDynamicStyles(venue, blockGrades);

  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const blockElement = target.closest("[data-block-name]");
    const blockName = blockElement?.getAttribute("data-block-name");

    if (blockName) {
      const block = venue?.blocks.find((b) => b.blockDataName === blockName);
      if (block) {
        onBlockSelect(String(block.id));
      }
    }
  };

  return (
    <div className="relative w-127.5 h-108.75">
      <>
        <style>{dynamicStyles}</style>
        <div
          className="w-full h-full [&>svg]:w-full [&>svg]:h-full select-none pointer-events-auto"
          dangerouslySetInnerHTML={{
            __html: svgContent ? svgContent : "",
          }}
          onClick={handleStageClick}
        />
      </>
    </div>
  );
}

const createDynamicStyles = (venue: VenueDetail, blockGrades: BlockGrade[]) => {
  if (!venue?.blocks || !blockGrades) return "";

  const blockColorMap: Record<string, string> = {};

  venue.blocks.forEach((block) => {
    const blockGrade = blockGrades.find((bg) => bg.blockId === block.id);
    if (blockGrade) {
      const color = gradeInfoColor[blockGrade.grade.name]?.fillColor;
      if (color) {
        blockColorMap[block.blockDataName] = color;
      }
    }
  });

  return Object.entries(blockColorMap)
    .map(
      ([name, color]) => `
          [data-block-name="${name}"] { fill: ${color} !important; transition: opacity 0.2s; } 
          [data-block-name="${name}"]:hover { cursor: pointer; }
        `,
    )
    .join("\n");
};
