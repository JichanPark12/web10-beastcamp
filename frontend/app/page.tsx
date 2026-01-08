/* eslint-disable @next/next/no-img-element */
import skydomAreaInfo from "../skydomAreaInfo";

export default function Home() {
  return (
    <div className="relative w-full max-w-150">
      <img
        src="http://ticketimage.interpark.com/TMGSNAS/TMGS/MiniMapHtml/25/img/25001605.gif"
        alt="Concert Hall Map"
        className="w-full h-auto block"
      />

      <svg
        viewBox="0 0 600 540"
        className="absolute top-0 left-0 w-full h-full"
      >
        {skydomAreaInfo.map((block) => {
          if (block.shape === "poly") {
            return (
              <polygon
                key={block.id}
                points={block.coords.join(",")} 
                className={`
                    cursor-pointer transition-all duration-200 ease-in-out
                  fill-transparent
                  `}
              />
            );
          }
          else if (block.shape === "rect") {

            const [x1, y1, x2, y2] = block.coords;
            return (
              <rect
                key={block.id}
                x={x1}
                y={y1}
                width={x2 - x1}
                height={y2 - y1}
                className={`
                    cursor-pointer transition-all duration-200 ease-in-out
       fill-transparent                   
                  `}
              />
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
}
