'use client';

import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  useChatMessagesQuery,
  useSendMessageMutation,
} from '@/app/_source/queries/chat';

export default function Chat() {
  const { nickname, userId } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useChatMessagesQuery();
  const { mutate: sendMessage, isPending } = useSendMessageMutation();

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    if (!nickname) {
      alert('닉네임을 먼저 설정해주세요!');
      return;
    }
    if (!userId) {
      alert('사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    sendMessage(
      {
        userId,
        message: inputValue.trim(),
      },
      {
        onSuccess: () => {
          setInputValue('');
        },
        onError: (error) => {
          alert(error.message || '메시지 전송에 실패했습니다.');
        },
      },
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 새 메시지 시 스크롤 하단으로 (채팅 영역 내에서만)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }, [messages]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-[600px]">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-white" />
          <div>
            <h2 className="text-xl font-bold text-white">방명록 </h2>
            <p className="text-sm text-purple-100">
              서비스 이용 후기를 남겨주세요!
            </p>
          </div>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>아직 메시지가 없습니다.</p>
              <p className="text-sm">첫 메시지를 남겨보세요!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.nickname === nickname ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  msg.nickname === nickname
                    ? 'bg-purple-500 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span
                    className={`text-sm font-semibold ${
                      msg.nickname === nickname
                        ? 'text-purple-100'
                        : 'text-purple-600'
                    }`}
                  >
                    {msg.nickname}
                  </span>
                  <span
                    className={`text-xs ${
                      msg.nickname === nickname
                        ? 'text-purple-200'
                        : 'text-gray-400'
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <p
                  className={`text-sm break-words ${
                    msg.nickname === nickname ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {msg.message}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-gray-200 p-4 bg-white">
        {!nickname ? (
          <div className="text-center text-gray-500 text-sm py-2">
            채팅을 시작하려면 오른쪽 상단에서 닉네임을 설정해주세요
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              maxLength={500}
              disabled={isPending}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            />
            <button
              onClick={handleSendMessage}
              disabled={isPending || !inputValue.trim()}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>전송</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
