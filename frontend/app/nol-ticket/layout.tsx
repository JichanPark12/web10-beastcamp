export const metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default async function NolTicketLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
