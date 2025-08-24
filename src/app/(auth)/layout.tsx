import { Star } from 'lucide-react';

const Logo = () => (
  <div className="flex items-center justify-center gap-2 mb-8">
    <Star className="h-8 w-8 text-primary" />
    <h1 className="text-3xl font-bold tracking-tight text-foreground">CryptoQuest</h1>
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
