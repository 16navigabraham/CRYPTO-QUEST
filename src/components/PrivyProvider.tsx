
'use client';
import { PrivyProvider } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      onSuccess={() => router.push('/home')}
      config={{
        loginMethods: ['email', 'wallet', 'google', 'github'],
        appearance: {
          theme: 'light',
          accentColor: '#0085FF',
          logo: '/logo.svg',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
