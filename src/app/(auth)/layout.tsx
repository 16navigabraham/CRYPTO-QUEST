

const Logo = () => (
  <div className="flex items-center justify-center gap-2 mb-8">
    <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{ textShadow: '1px 1px 0px hsl(var(--primary)), 2px 2px 0px hsl(var(--primary)), 3px 3px 0px hsl(var(--primary)), 4px 4px 0px hsl(var(--primary))'}}>CryptoQuest</h1>
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
