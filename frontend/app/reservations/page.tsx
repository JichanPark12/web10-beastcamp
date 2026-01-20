import Reservation from "./_source/components/Reservation";

export const dynamic = "force-dynamic"; // ci 통과용 실제 배포단계에선 필요없음 현재 nextjs api route를 사용하기 때문

interface PageProps {
  searchParams: Promise<{ sId?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  return <Reservation searchParams={searchParams} />;
}
