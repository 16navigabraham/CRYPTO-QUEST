
'use client';
import { PrivyProvider, usePrivy, type User } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createUser } from '@/app/actions';

function getUsername(user: User): string {
    if (user.twitter?.username) {
        return user.twitter.username;
    }
    if (user.github?.username) {
        return user.github.username;
    }
     if (user.discord?.username) {
        return user.discord.username;
    }
    if (user.email?.address) {
        return user.email.address.split('@')[0];
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
                   await createUser(embeddedWallet.address, getUsername(user));
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
        loginMethods: ['email', 'wallet', 'google', 'twitter', 'github', 'discord'],
        appearance: {
          theme: 'light',
          accentColor: '#00BFFF',
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
