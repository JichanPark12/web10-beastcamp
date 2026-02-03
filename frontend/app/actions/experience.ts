"use server";

import { cookies } from "next/headers";

export async function enableExperienceMode() {
  (await cookies()).set("EXPERIENCE_MODE", "true", {
    path: "/",
    httpOnly: false, // 클라이언트에서도 읽을 수 있게
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1일
  });
}

export async function disableExperienceMode() {
  (await cookies()).delete("EXPERIENCE_MODE");
}
