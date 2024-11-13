// src/app/page.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

export default function SetupPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-black"></div>;
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto flex justify-center py-8">
        <Image
          src="/images/panda-logo.png"
          alt="Panda Express Logo"
          width={200}
          height={66}
          className="object-contain"
          priority
        />
      </div>

      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 font-frutiger">
          Device Setup
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-0 bg-zinc-900 overflow-hidden shadow-lg transition-all hover:scale-105 cursor-pointer" 
                onClick={() => router.push('/customer/login')}>
            <CardHeader className="text-center">
              <h3 className="text-2xl font-bold text-white">Customer Kiosk</h3>
            </CardHeader>
            <CardContent className="text-center">
              <div className="h-32 flex items-center justify-center">
                <svg className="w-24 h-24 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <p className="text-gray-300 mt-4">
                Set up this device as a self-service customer ordering kiosk
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-zinc-900 overflow-hidden shadow-lg transition-all hover:scale-105 cursor-pointer"
                onClick={() => router.push('/login')}>
            <CardHeader className="text-center">
              <h3 className="text-2xl font-bold text-white">Employee Portal</h3>
            </CardHeader>
            <CardContent className="text-center">
              <div className="h-32 flex items-center justify-center">
                <svg className="w-24 h-24 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-gray-300 mt-4">
                Configure this device for employee access and management
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-zinc-900 overflow-hidden shadow-lg transition-all hover:scale-105 cursor-pointer"
                onClick={() => router.push('/menu-board')}>
            <CardHeader className="text-center">
              <h3 className="text-2xl font-bold text-white">Menu Board</h3>
            </CardHeader>
            <CardContent className="text-center">
              <div className="h-32 flex items-center justify-center">
                <svg className="w-24 h-24 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <p className="text-gray-300 mt-4">
                Display the digital menu board for customers
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}