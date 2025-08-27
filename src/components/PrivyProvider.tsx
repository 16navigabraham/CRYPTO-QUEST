
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
          theme: 'light',
          accentColor: '#00BFFF',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
      onSuccess={() => router.push('/profile/setup')}
    >
      {children}
    </PrivyProvider>
  );
}
