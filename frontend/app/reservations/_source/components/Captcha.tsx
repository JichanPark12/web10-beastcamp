// components/reservation/Captcha.tsx
"use client";

import { useState } from "react";
import { useReservationDispatch } from "../contexts/ReservationStateProvider";
import { CaptchaModal } from "./captcha-modal";

export default function Captcha() {
  const { completeCaptcha } = useReservationDispatch();
  const [isCaptchaModalOpen, setIsCaptchaModalOpen] = useState(true);

  const handleCaptchaVerified = () => {
    setIsCaptchaModalOpen(false);
    completeCaptcha();
  };

  const handleCloseCaptchaModal = () => {
    setIsCaptchaModalOpen(false);
  };

  return (
    <CaptchaModal
      isOpen={isCaptchaModalOpen}
      onVerified={handleCaptchaVerified}
      onClose={handleCloseCaptchaModal}
    />
  );
}
