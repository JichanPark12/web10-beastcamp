/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  X,
  Clock,
  Users,
  Shield,
  Armchair,
  Trophy,
  CheckCircle,
  ArrowLeft,
  ChevronLeft,
} from "lucide-react";
import { httpGet } from "../api";

interface TicketingSimulationProps {
  onClose: () => void;
}

type Step = "queue" | "seats" | "result";
type SeatGrade = "VIP" | "R" | "S" | "A" | "GENERAL";

interface Zone {
  id: string;
  name: string;
  grade: SeatGrade;
  price: number;
  available: number;
  color: string;
}

interface SelectedSeat {
  zone: string;
  seatNumber: number;
  grade: SeatGrade;
  price: number;
}

const seatStyleMap: any = {
  VIP석: "#7c68ee",
  R석: "#7c68ee",
  S석: "#1ca814",
  A석: "#3B82F6",
};

export const block = [
  {
    blockKey: "001:001",
    selfDefineBlock: "001",
    absoluteLeft: 312.3114,
    absoluteTop: 64,
    absoluteRight: 360.3114,
    absoluteBottom: 151,
  },
  {
    blockKey: "001:002",
    selfDefineBlock: "002",
    absoluteLeft: 253.04822,
    absoluteTop: 64,
    absoluteRight: 313.04822,
    absoluteBottom: 151,
  },
  {
    blockKey: "001:003",
    selfDefineBlock: "003",
    absoluteLeft: 186.66608,
    absoluteTop: 64,
    absoluteRight: 252.66608,
    absoluteBottom: 151,
  },
  {
    blockKey: "001:004",
    selfDefineBlock: "004",
    absoluteLeft: 127.29086,
    absoluteTop: 64,
    absoluteRight: 187.29086,
    absoluteBottom: 151,
  },
  {
    blockKey: "001:005",
    selfDefineBlock: "005",
    absoluteLeft: 79.5332,
    absoluteTop: 64,
    absoluteRight: 127.5332,
    absoluteBottom: 151,
  },
  {
    blockKey: "001:006",
    selfDefineBlock: "006",
    absoluteLeft: 312.3114,
    absoluteTop: 159,
    absoluteRight: 360.3114,
    absoluteBottom: 231,
  },
  {
    blockKey: "001:007",
    selfDefineBlock: "007",
    absoluteLeft: 250,
    absoluteTop: 159,
    absoluteRight: 316,
    absoluteBottom: 231,
  },
  {
    blockKey: "001:008",
    selfDefineBlock: "008",
    absoluteLeft: 192.27,
    absoluteTop: 156,
    absoluteRight: 252.27,
    absoluteBottom: 216,
  },
  {
    blockKey: "001:009",
    selfDefineBlock: "009",
    absoluteLeft: 127,
    absoluteTop: 159,
    absoluteRight: 193,
    absoluteBottom: 231,
  },
  {
    blockKey: "001:010",
    selfDefineBlock: "010",
    absoluteLeft: 79.71138,
    absoluteTop: 159.41733,
    absoluteRight: 128.96065,
    absoluteBottom: 230.56865,
  },
  {
    blockKey: "001:011",
    selfDefineBlock: "011",
    absoluteLeft: 311.55914,
    absoluteTop: 240,
    absoluteRight: 359.55914,
    absoluteBottom: 297,
  },
  {
    blockKey: "001:012",
    selfDefineBlock: "012",
    absoluteLeft: 250.87866,
    absoluteTop: 240,
    absoluteRight: 310.87866,
    absoluteBottom: 297,
  },
  {
    blockKey: "001:013",
    selfDefineBlock: "013",
    absoluteLeft: 188,
    absoluteTop: 237,
    absoluteRight: 248,
    absoluteBottom: 297,
  },
  {
    blockKey: "001:014",
    selfDefineBlock: "014",
    absoluteLeft: 128.6387,
    absoluteTop: 239.93994,
    absoluteRight: 188.6387,
    absoluteBottom: 296.93994,
  },
  {
    blockKey: "001:015",
    selfDefineBlock: "015",
    absoluteLeft: 81.218,
    absoluteTop: 240,
    absoluteRight: 129.218,
    absoluteBottom: 297,
  },
];

export function TicketingSimulation({ onClose }: TicketingSimulationProps) {
  const [step, setStep] = useState<Step>("queue");
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [queuePosition, setQueuePosition] = useState(15234);
  const [totalQueue, setTotalQueue] = useState(45678);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaCode] = useState("A7K9M2");
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [timeLog, setTimeLog] = useState<{ [key: string]: number }>({});
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [seatsInfo, setSeatsInfo] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchSeatsInfo = async () => {
      const totalCount = 15;
      let allSeatsData: any[] = [];
      for (let i = 1; i <= totalCount; i += 2) {
        const firstKey = i.toString().padStart(3, "0");
        let queryParams = `blockKeys=001%3A${firstKey}`;
        if (i + 1 <= totalCount) {
          const secondKey = (i + 1).toString().padStart(3, "0");
          queryParams += `&blockKeys=001%3A${secondKey}`;
        }
        const url = `https://tickets.interpark.com/onestop/api/seatMeta?goodsCode=25014056&placeCode=25001247&playSeq=001&${queryParams}&bizCode=WEBBR`;
        try {
          const response: any = await httpGet(url);
          if (response) allSeatsData = [...allSeatsData, ...response];
        } catch (error) {
          console.error(`API 호출 에러:`, error);
        }
      }
      setSeatsInfo(allSeatsData);
    };
    fetchSeatsInfo();
  }, []);
  // Queue simulation
  useEffect(() => {
    if (step === "queue") {
      setStepStartTime(Date.now());
      const interval = setInterval(() => {
        setQueuePosition((prev) => {
          const newPos = prev - Math.floor(Math.random() * 500) - 200;
          if (newPos <= 0) {
            clearInterval(interval);
            const timeSpent = (Date.now() - stepStartTime) / 1000;
            setTimeLog((prev) => ({ ...prev, queue: timeSpent }));
            setTimeout(() => {
              setStep("seats");
              setShowCaptchaModal(true);
              setStepStartTime(Date.now());
            }, 500);
            return 0;
          }
          return newPos;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [step, stepStartTime]);

  const handleCaptchaSubmit = () => {
    const timeSpent = (Date.now() - stepStartTime) / 1000;
    setTimeLog((prev) => ({ ...prev, captcha: timeSpent }));

    if (captchaInput.toUpperCase() === captchaCode) {
      setShowCaptchaModal(false);
      setStepStartTime(Date.now());
    } else {
      alert("보안문자가 일치하지 않습니다. 다시 시도해주세요.");
      setCaptchaInput("");
    }
  };

  const handleSeatClick = (seat: any) => {
    if (!seat.isExposable) return; // 이미 나간 좌석(포도알 아님)은 무시

    const isSelected = selectedSeats.some(
      (s) => s.seatInfoId === seat.seatInfoId
    );
    if (isSelected) {
      setSelectedSeats(
        selectedSeats.filter((s) => s.seatInfoId !== seat.seatInfoId)
      );
    } else if (selectedSeats.length < 2) {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleConfirmSeats = () => {
    const timeSpent = (Date.now() - stepStartTime) / 1000;
    setTimeLog((prev) => ({ ...prev, seats: timeSpent }));
    setStep("result");
  };

  const totalTime = Object.values(timeLog).reduce((a, b) => a + b, 0);
  const userRank = Math.floor(Math.random() * 1000) + 1;
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Queue Step - Modal Style */}
      {step === "queue" && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-xl">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl mb-2">대기열 진행 중</h3>
              <p className="text-gray-500 mb-8">잠시만 기다려주세요...</p>

              <div className="max-w-md mx-auto">
                <div className="bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                    style={{
                      width: `${((totalQueue - queuePosition) / totalQueue) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-8">
                  <span>대기 순서: {queuePosition.toLocaleString()}명</span>
                  <span>전체: {totalQueue.toLocaleString()}명</span>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <p className="text-sm text-gray-600">
                    💡 실제 티켓팅처럼 긴장감 있게 대기 중입니다
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: 좌석 선택 (실제 API 데이터 사용) */}
      {step === "seats" && (
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <button onClick={onClose}>
                <ArrowLeft />
              </button>
              <h2 className="font-bold">실시간 좌석 선택 (Simulation)</h2>
            </div>
            <div className="text-purple-600 font-bold">
              선택: {selectedSeats.length} / 2
            </div>
          </header>

          <main className="flex-1 flex flex-col items-center p-4">
            {!seatsInfo ? (
              <div className="flex flex-col items-center mt-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
                <p>실시간 좌석 데이터를 불러오는 중...</p>
              </div>
            ) : (
              <div className="relative bg-white p-4 rounded-xl shadow-lg border border-gray-300 overflow-hidden">
                {/* 배경 이미지 */}
                <div className="relative w-[894px] h-[636px]">
                  <img
                    src="./test.svg"
                    className="w-full h-full object-contain opacity-50 select-none"
                    alt="map"
                  />

                  {/* 실시간 좌석 SVG */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 447 318"
                  >
                    {block?.map((b, idx) => (
                      <g key={b.blockKey} id={b.blockKey}>
                        {seatsInfo[idx]?.seats.map((seat: any) => {
                          const isSelected = selectedSeats.some(
                            (s) => s.seatInfoId === seat.seatInfoId
                          );
                          return (
                            <circle
                              key={seat.seatInfoId}
                              cx={seat.posLeft}
                              cy={seat.posTop}
                              r={1}
                              fill={
                                isSelected
                                  ? "#FF0000"
                                  : seat.isExposable
                                    ? seatStyleMap[seat.seatGradeName] ||
                                      "#7c68ee"
                                    : "#EDEFF3"
                              }
                              stroke={
                                isSelected
                                  ? "#FF0000"
                                  : seat.isExposable
                                    ? "#000"
                                    : "#EDEFF3"
                              }
                              strokeWidth={isSelected ? 0.3 : 0.1}
                              className={
                                seat.isExposable
                                  ? "cursor-pointer hover:r-2"
                                  : ""
                              }
                              style={{ pointerEvents: "auto" }}
                              onClick={() => handleSeatClick(seat)}
                            />
                          );
                        })}
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            )}

            {/* 하단 선택바 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-center">
              <div className="max-w-4xl w-full flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {selectedSeats.length > 0
                    ? selectedSeats
                        .map((s) => `[${s.seatGradeName}] ${s.salesPrice}`)
                        .join(", ")
                    : "좌석을 선택하세요"}
                </div>
                <button
                  onClick={handleConfirmSeats}
                  disabled={selectedSeats.length === 0}
                  className="bg-purple-600 text-white px-10 py-3 rounded-lg disabled:bg-gray-300"
                >
                  좌석선택완료
                </button>
              </div>
            </div>
          </main>
        </div>
      )}
      {/* Captcha Modal Overlay */}
      {showCaptchaModal && step === "seats" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl mb-2 text-center">보안문자 입력</h3>
            <p className="text-gray-500 mb-8 text-center">
              아래 문자를 정확히 입력해주세요
            </p>

            <div className="bg-gray-100 rounded-lg p-8 mb-6 text-center">
              <div
                className="text-4xl tracking-widest select-none"
                style={{
                  fontFamily: "monospace",
                  textDecoration: "line-through wavy",
                  textDecorationColor: "#e5e7eb",
                }}
              >
                {captchaCode}
              </div>
            </div>

            <input
              type="text"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCaptchaSubmit()}
              placeholder="보안문자 입력"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 text-center text-lg tracking-widest"
              maxLength={6}
              autoFocus
            />

            <button
              onClick={handleCaptchaSubmit}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              확인
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              💡 힌트: 보안문자는 대소문자를 구분하지 않습니다
            </p>
          </div>
        </div>
      )}

      {/* Result Step */}
      {step === "result" && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-xl">
            <div className="py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl mb-2 text-center">예매 완료!</h3>
              <p className="text-gray-500 mb-8 text-center">
                티켓팅 결과를 확인하세요
              </p>

              <div className="max-w-md mx-auto space-y-4">
                {/* Success Badge */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-green-800">
                    성공적으로 티켓을 예매했습니다!
                  </p>
                </div>

                {/* Time Breakdown */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    단계별 소요 시간
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">대기열 통과</span>
                      <span>{timeLog.queue?.toFixed(1)}초</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">보안문자 입력</span>
                      <span>{timeLog.captcha?.toFixed(1)}초</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">좌석 선택</span>
                      <span>{timeLog.seats?.toFixed(1)}초</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                      <span>총 소요 시간</span>
                      <span className="text-purple-600">
                        {totalTime.toFixed(1)}초
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rank */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 text-center">
                  <p className="text-gray-600 mb-2">전체 사용자 중</p>
                  <p className="text-3xl text-purple-600 mb-2">{userRank}위</p>
                  <p className="text-sm text-gray-500">
                    상위 {((userRank / 10000) * 100).toFixed(1)}%
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
