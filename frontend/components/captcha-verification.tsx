'use client';

import { useState, useEffect } from 'react';
import { fetchCaptcha, verifyCaptcha } from '@/lib/ticket-service';

interface CaptchaVerificationProps {
  onVerified: () => void;
  onError?: (error: string) => void;
}

export function CaptchaVerification({
  onVerified,
  onError,
}: CaptchaVerificationProps) {
  const [captchaId, setCaptchaId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // 보안 문자 로드
  const loadCaptcha = async () => {
    setIsLoading(true);
    setError('');
    setUserInput('');

    try {
      // 이전 이미지 URL 정리
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }

      const data = await fetchCaptcha();
      setCaptchaId(data.captchaId);
      setImageUrl(data.imageUrl);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : '보안 문자를 불러오는데 실패했습니다.';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 보안 문자 로드
  useEffect(() => {
    loadCaptcha();

    // 언마운트 시 URL 정리
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 검증 처리
  const handleVerify = async () => {
    if (!userInput.trim()) {
      setError('보안 문자를 입력해주세요.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const result = await verifyCaptcha(captchaId, userInput);

      if (result.success) {
        onVerified();
      } else {
        setError(result.message);
        onError?.(result.message);
        // 실패 시 새로운 보안 문자 로드
        await loadCaptcha();
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : '보안 문자 검증에 실패했습니다.';
      setError(errorMsg);
      onError?.(errorMsg);
      // 에러 시에도 새로운 보안 문자 로드
      await loadCaptcha();
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
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : imageUrl ? (
          <div className="flex justify-center">
            <img src={imageUrl} alt="보안 문자" className="max-w-full h-auto" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 text-gray-500">
            보안 문자를 불러올 수 없습니다
          </div>
        )}
      </div>

      {/* 새로고침 버튼 */}
      <button
        type="button"
        onClick={loadCaptcha}
        disabled={isLoading}
        className="w-full mb-4 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
      >
        {isLoading ? '로딩 중...' : '🔄 다른 보안문자 보기'}
      </button>

      {/* 입력 필드 */}
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
        placeholder="보안문자 입력"
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 text-center text-lg tracking-widest"
        maxLength={6}
        autoFocus
        disabled={isVerifying || isLoading}
      />

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-sm text-red-600 text-center">{error}</p>
        </div>
      )}

      {/* 확인 버튼 */}
      <button
        onClick={handleVerify}
        disabled={isVerifying || isLoading || !userInput.trim()}
        className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
      >
        {isVerifying ? '검증 중...' : '확인'}
      </button>

      {/* 힌트 */}
      <p className="text-xs text-gray-500 text-center mt-4">
        💡 힌트: 보안문자는 대소문자를 구분하지 않습니다
      </p>
    </div>
  );
}
