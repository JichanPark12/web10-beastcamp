"use client";

import { useState, useEffect, useRef } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchCaptcha, verifyCaptcha } from "@/services/ticket";
import { useAuth } from "@/contexts/AuthContext";
import { isExperienceMode } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CaptchaVerificationProps {
  onVerified: () => void;
  onError?: (error: string) => void;
}

export function CaptchaVerification({
  onVerified,
  onError,
}: CaptchaVerificationProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [userInput, setUserInput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { token: realToken } = useAuth();

  const isExperience = isExperienceMode();
  const token = realToken || (isExperience ? "isExperience" : undefined);
  const router = useRouter();
  // useSuspenseQuery로 보안 문자 데이터 로드
  // Suspense와 ErrorBoundary가 로딩/에러 상태를 처리
  // ssr: false로 클라이언트에서만 실행 (Blob URL hydration 에러 방지)
  const { data: captchaData } = useSuspenseQuery({
    queryKey: ["captcha", refreshKey],
    queryFn: () => {
      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }
      return fetchCaptcha(token);
    },
    staleTime: 0, // 항상 새로운 보안문자 요청
  });

  const { captchaId, imageUrl } = captchaData;

  // 보안 문자 새로고침
  const refreshCaptcha = () => {
    setRefreshKey((prev) => prev + 1);
    setUserInput("");
    setError("");
  };

  // 언마운트 시 URL 정리
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  // 입력값 변경 시 처리 (에러 초기화 안함)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value.toUpperCase());
  };

  // 포커스 시 에러 메시지 초기화
  const handleInputFocus = () => {
    if (error) {
      setError("");
    }
  };

  // 검증 처리
  const handleVerify = async () => {
    if (!userInput.trim()) {
      setError("보안 문자를 입력해주세요.");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }
      const result = await verifyCaptcha(token, captchaId, userInput);

      if (result.success) {
        toast.success("보안 문자 검증 성공");
        onVerified();
      } else {
        // 에러 표시하고 입력창 리셋 후 포커스
        setError(result.message);
        setUserInput("");
        onError?.(result.message);
        // 포커스 복원
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "보안 문자 검증에 실패했습니다.";
      // 401시 메인 이동
      if (err instanceof Error && err.message.includes("401")) {
        alert("인증이 만료되었습니다. 메인으로 이동합니다.");
        router.replace("/");
      }
      // 에러 표시하고 입력창 리셋 후 포커스
      setError(errorMsg);
      setUserInput("");
      onError?.(errorMsg);
      // 포커스 복원
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
      {/* 아이콘 헤더 */}
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </div>

      <h3 className="text-2xl mb-2 text-center">보안문자 입력</h3>
      <p className="text-gray-500 mb-8 text-center">
        아래 문자를 정확히 입력해주세요
      </p>

      {/* 보안 문자 이미지 */}
      <div className="bg-gray-100 rounded-lg p-8 mb-6">
        <div className="flex justify-center">
          <img src={imageUrl} alt="보안 문자" className="max-w-full h-auto" />
        </div>
      </div>

      {/* 새로고침 버튼 */}
      <button
        type="button"
        onClick={refreshCaptcha}
        className="w-full mb-4 text-sm text-blue-600 hover:text-blue-800 transition-colors"
      >
        🔄 다른 보안문자 보기
      </button>

      {/* 입력 필드 */}
      <div className="mb-4">
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          placeholder="보안문자 입력"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-center text-lg tracking-widest transition-colors ${
            error
              ? "border-red-300 focus:ring-red-500 bg-red-50"
              : "border-gray-200 focus:ring-purple-500"
          }`}
          maxLength={6}
          autoFocus
          disabled={isVerifying}
          aria-invalid={!!error}
          aria-describedby={error ? "captcha-error" : undefined}
        />

        {/* 에러 메시지 - 입력창 바로 아래 caption 형태 */}
        {error && (
          <p
            id="captcha-error"
            className="mt-2 text-sm text-red-600 text-center"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>

      {/* 확인 버튼 */}
      <button
        onClick={handleVerify}
        disabled={isVerifying || !userInput.trim()}
        className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
      >
        {isVerifying ? "검증 중..." : "확인"}
      </button>

      {/* 힌트 */}
      <p className="text-xs text-gray-500 text-center mt-4">
        💡 힌트: 보안문자는 대소문자를 구분하지 않습니다
      </p>
    </div>
  );
}
