'use client';

import { toast } from 'sonner';
import { CaptchaVerification } from './captcha-verification';

interface CaptchaModalProps {
  isOpen: boolean;
  onVerified: () => void;
  onClose: () => void;
}

export function CaptchaModal({
  isOpen,
  onVerified,
  onClose,
}: CaptchaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* 모달 컨텐츠 */}
      <div className="relative z-10 w-full max-w-md">
        <CaptchaVerification onVerified={onVerified} />
      </div>
    </div>
  );
}
