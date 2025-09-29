'use client';
import { PrivyProvider } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        loginMethods: ['email'],
        appearance: {
          showWalletLoginFirst: false,
          theme: 'light',
          accentColor: '#10B981',
          logo: '/cat.jpg',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
      onSuccess={() => router.push('/home')}
    >
      {children}
    </PrivyProvider>
  );
}
