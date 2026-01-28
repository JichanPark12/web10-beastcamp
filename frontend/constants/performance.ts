import { TicketPlatform } from "@/types/performance";

export const PLATFORM_DISPLAY_NAME: Record<TicketPlatform, string> = {
  interpark: "NOL티켓", //deprecated interpark platform
  "nol-ticket": "NOL티켓",
  yes24: "YES24",
  "melon-ticket": "멜론티켓",
};
