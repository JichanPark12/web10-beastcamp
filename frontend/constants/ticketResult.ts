import { SeatGrade } from "@/types/seat";

export const gradeInfo: {
  [K in SeatGrade]: {
    name: string;
    price: number;
    fillColor: string;
    textColor: string;
  };
} = {
  VIP: {
    name: "VIP석",
    price: 154000,
    fillColor: "#9333ea",
    textColor: "text-purple-600",
  },
  R: {
    name: "R석",
    price: 143000,
    fillColor: "#ec4899",
    textColor: "text-pink-600",
  },
  S: {
    name: "S석",
    price: 132000,
    fillColor: "#3b82f6",
    textColor: "text-blue-600",
  },
  A: {
    name: "A석",
    price: 110000,
    fillColor: "#22c55e",
    textColor: "text-green-600",
  },
  GENERAL: {
    name: "일반석",
    price: 99000,
    fillColor: "#6b7280",
    textColor: "text-gray-600",
  },
};
