import VersionSelector from "@/app/components/VersionSelector";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <VersionSelector />
    </>
  );
}
