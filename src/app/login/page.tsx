// src/app/login/page.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');

    try {
      const trimmedUsername = username.trim();

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedUsername, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem("employeeName", data.name);
      if (data.job?.toLowerCase() === 'manager') {
        router.push('/manager');
      } else if (data.job?.toLowerCase() === 'crew') {
        router.push('/cashier-dashboard');
      } else {
        setError('Invalid employee role');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    router.push('/customer');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-black to-orange-950">
      {/* Logo Section */}
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
          <CardTitle className="text-2xl text-center text-orange-600">Employee Login</CardTitle>
          <CardDescription className="text-center">
            Sign in to access the POS system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                required
                className="border-orange-200 focus:border-orange-500"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="border-orange-200 focus:border-orange-500"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show-password"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="cursor-pointer accent-orange-500"
                disabled={isLoading}
              />
              <Label htmlFor="show-password" className="cursor-pointer text-gray-700">
                Show Password
              </Label>
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⚪</span>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-orange-600 text-orange-600 hover:bg-orange-50"
                onClick={handleGuestAccess}
                disabled={isLoading}
              >
                Place an Order as a Customer
              </Button>
              <Link href="/">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  disabled={isLoading}
                >
                  View Menu Board
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;