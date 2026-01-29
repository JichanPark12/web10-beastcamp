import { cookies } from "next/headers";

export async function clearQueueCookies() {
  (await cookies()).delete("waiting-token");
}
