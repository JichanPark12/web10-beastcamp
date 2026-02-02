export const metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default async function Yes24Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
