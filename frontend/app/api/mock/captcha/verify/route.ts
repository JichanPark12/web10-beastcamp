import { NextRequest, NextResponse } from "next/server";
import { captchaStore } from "../route";

export interface VerifyCaptchaRequest {
  captchaId: string;
  userInput: string;
}

export interface VerifyCaptchaResponse {
  success: boolean;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyCaptchaRequest = await request.json();
    const { captchaId, userInput } = body;

    if (!captchaId || !userInput) {
      return NextResponse.json(
        {
          success: false,
          message: "captchaId and userInput are required",
        } as VerifyCaptchaResponse,
        { status: 400 },
      );
    }

    // 보안 문자 확인
    const captchaData = captchaStore.get(captchaId);

    if (!captchaData) {
      return NextResponse.json(
        {
          success: false,
          message: "보안 문자를 찾을 수 없거나 만료되었습니다.",
        } as VerifyCaptchaResponse,
        { status: 404 },
      );
    }

    // 대소문자 구분 없이 비교
    const isValid =
      userInput.toUpperCase() === captchaData.text.toUpperCase();

    // 검증 후 보안 문자 삭제 (재사용 방지)
    captchaStore.delete(captchaId);

    if (!isValid) {
      return NextResponse.json({
        success: false,
        message: "보안 문자가 일치하지 않습니다.",
      } as VerifyCaptchaResponse);
    }

    return NextResponse.json({
      success: true,
      message: "보안 문자 검증 성공",
    } as VerifyCaptchaResponse);
  } catch (error) {
    console.error("Captcha verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "보안 문자 검증 중 오류가 발생했습니다.",
      } as VerifyCaptchaResponse,
      { status: 500 },
    );
  }
}
