'use client';

import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { ready, authenticated, login, isNotifying } = usePrivy();

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const disabled = !ready || isNotifying || (ready && authenticated);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Welcome Back!</CardTitle>
        <CardDescription>Login to access your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={login} className="w-full" disabled={disabled}>
          {(isNotifying || (ready && authenticated)) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Log In
        </Button>
      </CardContent>
       <CardFooter className="flex flex-col gap-2 text-sm">
        <Link href="/register" className="text-primary hover:underline">
            Don't have an account? Sign Up
        </Link>
      </CardFooter>
    </Card>
  );
}
