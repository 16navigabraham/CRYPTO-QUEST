

import VoxelText from "@/components/VoxelText";

const Logo = () => (
  <div className="flex items-center justify-center gap-2 mb-8">
    <VoxelText text="CryptoQuest" />
  </div>
);

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Logo />
        {children}
    </main>
  );
}
