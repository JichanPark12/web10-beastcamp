import { useEffect } from "react";

/**
 * 새로고침 및 탭 닫기 시 브라우저 경고창을 띄우는 훅
 */
export const usePreventRefresh = () => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
};
