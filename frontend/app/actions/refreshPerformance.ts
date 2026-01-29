"use server";

import { revalidateTag } from "next/cache";

export async function refreshPerformance() {
  revalidateTag("latest-performance", "max");
}
