"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type DeviceOption = {
  title: string;
  description: string;
  route: string;
  icon: JSX.Element;
};

export default function SetupPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);

  const deviceOptions: DeviceOption[] = [
    {
      title: "Customer Kiosk",
      description:
        "Set up this device as a self-service customer ordering kiosk",
      route: "/customer/login",
      icon: (
        <svg
          className="w-20 h-20 text-orange-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
          />
        </svg>
      ),
    },
    {
      title: "Employee Portal",
      description: "Configure this device for employee access and management",
      route: "/login",
      icon: (
        <svg
          className="w-20 h-20 text-orange-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      title: "Menu Board",
      description: "Display the digital menu board for customers",
      route: "/menu-board",
      icon: (
        <svg
          className="w-20 h-20 text-orange-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      ),
    },
    {
      title: "Static Menu Board",
      description:
        "Display a non-interactive menu board for multi-display setups",
      route: "/static-menu",
      icon: (
        <svg
          className="w-20 h-20 text-orange-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
          />
        </svg>
      ),
    },
  ];

  const speak = (text: string, title: string) => {
    window.speechSynthesis.cancel();

    if (speaking === title) {
      setSpeaking(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeaking(null);
    window.speechSynthesis.speak(utterance);
    setSpeaking(title);
  };

  useEffect(() => {
    setMounted(true);
    return () => {
      window.speechSynthesis.cancel();
    };
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {deviceOptions.map((option) => (
            <Card
              key={option.title}
              className="border-0 bg-zinc-900 overflow-hidden shadow-lg transition-all hover:scale-105 cursor-pointer relative"
              onClick={() => router.push(option.route)}
            >
              <CardHeader className="text-center">
                <h3 className="text-xl font-bold text-white">{option.title}</h3>
              </CardHeader>
              <CardContent className="text-center">
                <div className="h-28 flex items-center justify-center">
                  {option.icon}
                </div>
                <p className="text-gray-300 mt-4 text-sm">
                  {option.description}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(
                      `${option.title}. ${option.description}`,
                      option.title
                    );
                  }}
                  className="absolute top-4 right-4 p-2 hover:bg-zinc-800 rounded-full transition-colors"
                  aria-label={
                    speaking === option.title ? "Stop speaking" : "Read aloud"
                  }
                >
                  {speaking === option.title ? (
                    <VolumeX className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-gray-400 hover:text-amber-500" />
                  )}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
