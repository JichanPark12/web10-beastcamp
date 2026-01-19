import { getServerUrl } from '@/constants/api';
import { api } from './api';

export interface CaptchaResponse {
  captchaId: string;
  imageUrl: string;
}

export interface VerifyCaptchaResponse {
  success: boolean;
  message: string;
}

// 보안 문자 이미지 요청
export async function fetchCaptcha(): Promise<CaptchaResponse> {
  const ticketServerUrl = getServerUrl('ticket');
  const response = await fetch(`${ticketServerUrl}/captcha`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('보안 문자 이미지를 가져오는데 실패했습니다.');
  }

  // X-Captcha-Id 헤더에서 captchaId 가져오기
  const captchaId = response.headers.get('X-Captcha-Id');
  if (!captchaId) {
    throw new Error('보안 문자 ID를 찾을 수 없습니다.');
  }

  // 이미지 데이터를 Blob으로 받아서 URL 생성
  const imageBlob = await response.blob();
  const imageUrl = URL.createObjectURL(imageBlob);

  return {
    captchaId,
    imageUrl,
  };
}

// 보안 문자 검증
export async function verifyCaptcha(
  captchaId: string,
  userInput: string
): Promise<VerifyCaptchaResponse> {
  return api.post<VerifyCaptchaResponse>(
    '/captcha/verify',
    { captchaId, userInput },
    { serverType: 'ticket', credentials: 'include' }
  );
}
