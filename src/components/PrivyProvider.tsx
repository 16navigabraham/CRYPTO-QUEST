
'use client';
import { PrivyProvider, usePrivy, type User } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createUser } from '@/app/actions';

function getUsername(user: User): string {
    if (user.twitter?.username) {
        return user.twitter.username;
    }
    return 'Anonymous';
}

function InnerPrivyProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, ready, authenticated } = usePrivy();

    useEffect(() => {
        const handleLogin = async () => {
            if (ready && authenticated && user) {
                const embeddedWallet = user.wallets?.find(w => w.walletClientType === 'privy');
                if (embeddedWallet) {
                   await createUser(user.id, embeddedWallet.address, getUsername(user));
                }
                router.push('/home');
            }
        };

        handleLogin();
    }, [ready, authenticated, user, router]);
    
    return <>{children}</>;
}


export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        loginMethods: ['email'],
        appearance: {
          theme: 'light',
          accentColor: '#0085FF',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
        <InnerPrivyProvider>
            {children}
        </InnerPrivyProvider>
    </PrivyProvider>
  );
}

    