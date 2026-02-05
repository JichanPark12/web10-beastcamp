"use client";

import { User } from "lucide-react";
import { useState } from "react";
import {
  useRegisterNicknameMutation,
  useNicknameQuery,
} from "@/app/_source/queries/chat";
import { useSessionStore } from "@/stores/sessionStore";

export default function UserNickname() {
  const { sessionId } = useSessionStore();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { mutate: registerNickname, isPending } = useRegisterNicknameMutation();

  // 서버에서 닉네임 조회 (세션 ID 기반)
  const { data: nickname } = useNicknameQuery(sessionId);

  const handleSaveNickname = () => {
    if (!inputValue.trim() || !sessionId) return;

    setErrorMessage("");
    registerNickname(
      {
        sessionId,
        nickname: inputValue.trim(),
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setInputValue("");
          setErrorMessage("");
        },
        onError: (error) => {
          setErrorMessage(error.message || "닉네임 등록에 실패했습니다.");
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveNickname();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue("");
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            onKeyDown={handleKeyPress}
            onBlur={handleSaveNickname}
            placeholder="닉네임 입력"
            minLength={2}
            maxLength={20}
            disabled={isPending}
            autoFocus
            className={`px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-100 ${
              errorMessage
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-purple-500"
            }`}
          />
        </div>
        {errorMessage && (
          <p className="text-xs text-red-600 px-1">{errorMessage}</p>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setIsEditing(true);
        setInputValue(nickname || "");
        setErrorMessage("");
      }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
    >
      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
        <User className="w-5 h-5 text-white" />
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">
        {nickname || "닉네임 설정"}
      </span>
    </button>
  );
}
