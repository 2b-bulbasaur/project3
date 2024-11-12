'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signIn, useSession, signOut } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import GoogleTranslate from '@/components/Translation';

const CustomerLoginPage = () => {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);
    await signIn('google'); // Trigger Google OAuth login
    setIsLoading(false);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut(); // Log the user out
    setIsLoading(false);
  };

  const handleGuestAccess = () => {
    router.push('/customer'); // Redirect directly to the customer page
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-orange-950">
        <h1 className="text-white text-xl">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-black to-orange-950">
      <div className="absolute top-5 left-5 p-4 z-50">
        <GoogleTranslate />
      </div>
      
      <Link href="/" className="mb-8">
        <Image 
          src="/images/panda-logo.png" 
          alt="Panda Express Logo" 
          width={200} 
          height={67} 
          className="cursor-pointer"
          priority
        />
      </Link>

      <Card className="w-full max-w-md mx-4 bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-orange-600">Customer Login</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your account or place an order
          </CardDescription>
        </CardHeader>
        <CardContent>
          {session?.user ? (
            <div className="space-y-4 text-center">
              <p className="text-gray-700">Welcome back, {session.user.name || 'Customer'}!</p>
              <p className="text-gray-500">Email: {session.user.email}</p>
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700" 
                onClick={() => router.push('/customer')}
                disabled={isLoading}
              >
                Continue to Place Order
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-orange-600 text-orange-600 hover:bg-orange-50" 
                onClick={handleLogout}
                disabled={isLoading}
              >
                Log Out
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700" 
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⚪</span>
                    Logging in...
                  </span>
                ) : (
                  'Log In with Google'
                )}
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-orange-600 text-orange-600 hover:bg-orange-50" 
                onClick={handleGuestAccess}
                disabled={isLoading}
              >
                Place an Order as Guest
              </Button>
              <Link href="/">
                <Button 
                  variant="ghost" 
                  className="w-full text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  disabled={isLoading}
                >
                  View Menu Board
                </Button>
              </Link>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerLoginPage;
