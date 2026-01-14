import { useRef, useState } from "react";

interface UseZoomPanOptions {
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  initialOffset?: { x: number; y: number };
}

export const useZoomPan = (options: UseZoomPanOptions = {}) => {
  const [isMinScale, setIsMinScale] = useState(true);

  const {
    minScale = 0.3,
    maxScale = 7,
    initialScale = 1,
    initialOffset = { x: 0, y: 0 },
  } = options;

  const scaleRef = useRef(initialScale);
  const offsetRef = useRef(initialOffset);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // DOM에 직접 접근하여 구현으로 리렌더링을 최소화함
  // 어짜피 transform 스타일만 변경하는데 컴포넌트가 리렌더 될 필요가 있나?? 라는 생각함
  const updateDOM = (s: number, x: number, y: number) => {
    if (contentRef.current) {
      contentRef.current.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    }
    const isCurrentlyMin = s <= minScale + 0.01;

    if (isCurrentlyMin !== isMinScale) {
      setIsMinScale(isCurrentlyMin);
    }
  };

  const applyZoom = (originX: number, originY: number, delta: number) => {
    const currentScale = scaleRef.current;
    const nextScale = Math.min(
      Math.max(currentScale * delta, minScale),
      maxScale
    );

    if (nextScale === currentScale) return; // 변동 없으면 중단

    const ratio = nextScale / currentScale;
    const newX = originX - (originX - offsetRef.current.x) * ratio;
    const newY = originY - (originY - offsetRef.current.y) * ratio;

    offsetRef.current = { x: newX, y: newY };
    scaleRef.current = nextScale;
    updateDOM(nextScale, newX, newY);
  };

  const reset = () => {
    offsetRef.current = initialOffset;
    scaleRef.current = initialScale;
    updateDOM(initialScale, initialOffset.x, initialOffset.y);
  };

  const handleZoom = (isZoomIn: boolean) => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    applyZoom(width / 2, height / 2, isZoomIn ? 1.5 : 1 / 1.5);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!containerRef.current) return;
    const { left, top } = containerRef.current.getBoundingClientRect();
    applyZoom(e.clientX - left, e.clientY - top, e.deltaY > 0 ? 0.9 : 1.1);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    if (contentRef.current) contentRef.current.style.transition = "none";
    dragStart.current = {
      x: e.clientX - offsetRef.current.x,
      y: e.clientY - offsetRef.current.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;

    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;

    offsetRef.current = { x: newX, y: newY };
    updateDOM(scaleRef.current, newX, newY);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (contentRef.current)
      contentRef.current.style.transition = "transform 0.2s ease-out";
  };

  const moveTo = (
    targetX: number, // SVG 좌표
    targetY: number, // SVG 좌표
    newScale: number,
    contentWidth: number, // SVG 너비..
    contentHeight: number // SVG 높이..
  ) => {
    if (!containerRef.current || !contentRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    const flexOffsetX = (rect.width - contentWidth) / 2;
    const flexOffsetY = (rect.height - contentHeight) / 2;

    const actualTargetX = flexOffsetX + targetX;
    const actualTargetY = flexOffsetY + targetY;

    const finalX = rect.width / 2 - actualTargetX * newScale;
    const finalY = rect.height / 2 - actualTargetY * newScale;

    offsetRef.current = { x: finalX, y: finalY };
    scaleRef.current = newScale;

    updateDOM(newScale, finalX, finalY);
  };

  return {
    containerRef,
    contentRef,
    isMinScale,
    reset,
    zoomIn: () => handleZoom(true),
    zoomOut: () => handleZoom(false),
    moveTo,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
