
'use client';

import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, User as UserIcon, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserProfile, updateUser } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be 20 characters or less'),
  profilePicture: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function getUsername(user: any): string {
    if (!user) return 'Anonymous';
    return user.twitter?.username || user.github?.username || user.discord?.username || user.email?.address.split('@')[0] || 'Anonymous';
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { ready, authenticated, user } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      profilePicture: null,
    },
  });

  const fetchProfile = useCallback(async () => {
    if (user?.wallet?.address) {
      try {
        const profile = await getUserProfile(user.wallet.address);
        if (profile && profile.data) {
          form.reset({
            username: profile.data.username || getUsername(user),
          });
          if(profile.data.profilePicture) {
            setImagePreview(profile.data.profilePicture);
          }
        } else {
           form.reset({
            username: getUsername(user),
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch your profile.' });
         form.reset({ username: getUsername(user) });
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, form, toast]);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/login');
    }
    if (ready && authenticated && user) {
        fetchProfile();
    }
  }, [ready, authenticated, router, user, fetchProfile]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('profilePicture', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user?.wallet?.address) {
      toast({ variant: 'destructive', title: 'Error', description: 'Wallet not connected.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await updateUser(user.wallet.address, values.username, values.profilePicture);
      toast({ title: 'Success', description: 'Your profile has been updated.' });
      router.push('/home');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Update Failed', description: error instanceof Error ? error.message : 'An unknown error occurred.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!ready || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-6 w-6" />
            Edit Your Profile
          </CardTitle>
          <CardDescription>
            Choose a username and upload an avatar to be seen on the leaderboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Satoshi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="profilePicture"
                render={() => (
                  <FormItem>
                    <FormLabel>Profile Picture</FormLabel>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-2 border-primary">
                            <AvatarImage src={imagePreview || `https://placehold.co/100x100.png`} data-ai-hint="avatar" />
                            <AvatarFallback>{form.watch('username')?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <FormControl>
                            <Button asChild variant="outline">
                                <label>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Image
                                    <input type="file" className="sr-only" accept="image/png, image/jpeg, image/gif" onChange={handleImageChange} />
                                </label>
                            </Button>
                        </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => router.push('/home')}>
                    Skip
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save and Continue
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
