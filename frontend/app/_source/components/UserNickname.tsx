"use client";

import { useAuth } from "@/contexts/AuthContext";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import {
  useRegisterNicknameMutation,
  useNicknameQuery,
} from "@/app/_source/queries/chat";

export default function UserNickname() {
  const { nickname, setNickname, userId } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { mutate: registerNickname, isPending } = useRegisterNicknameMutation();

  // 서버에서 닉네임 조회
  const { data: serverNickname } = useNicknameQuery(userId);

  useEffect(() => {
    // 서버에서 닉네임을 가져와서 상태 업데이트
    if (serverNickname) {
      setNickname(serverNickname);
    }
  }, [serverNickname, setNickname]);

  const handleSaveNickname = () => {
    if (!inputValue.trim() || !userId) return;

    registerNickname(
      {
        userId,
        nickname: inputValue.trim(),
      },
      {
        onSuccess: () => {
          setNickname(inputValue.trim());
          setIsEditing(false);
          setInputValue("");
        },
        onError: (error) => {
          alert(error.message || "닉네임 등록에 실패했습니다.");
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
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleSaveNickname}
          placeholder="닉네임 입력"
          minLength={2}
          maxLength={20}
          disabled={isPending}
          autoFocus
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setIsEditing(true);
        setInputValue(nickname || "");
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
