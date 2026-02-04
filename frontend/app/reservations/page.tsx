import { cookies } from "next/headers";
import Reservation from "./_source/components/Reservation";
import NolExperienceRservation from "./_source/experienceMode/nolTicket/components/NolExperienceRservation";

export const dynamic = "force-dynamic"; // ci 통과용 실제 배포단계에선 필요없음 현재 nextjs api route를 사용하기 때문

interface PageProps {
  searchParams: Promise<{ sId?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const cookieStore = await cookies();

  const experienceMode = cookieStore.get("EXPERIENCE_MODE");
  return experienceMode ? (
    <NolExperienceRservation searchParams={searchParams} />
  ) : (
    <Reservation searchParams={searchParams} />
  );
}
