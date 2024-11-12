// src/app/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import GoogleTranslate from "@/components/Translation";

type MenuItem = {
  name: string;
  image: string;
  description: string;
  calories: string;
  type: "entree" | "side";
};

const menuItemsData: MenuItem[] = [
  {
    name: "The Original Orange Chicken",
    image: "/images/orange-chicken.jpg",
    description:
      "Our signature dish. Crispy chicken wok-tossed in a sweet and spicy orange sauce.",
    calories: "490",
    type: "entree",
  },
  {
    name: "Beijing Beef",
    image: "/images/beijing-beef.jpg",
    description: "Crispy beef, bell peppers and onions in a sweet-tangy sauce.",
    calories: "470",
    type: "entree",
  },
  {
    name: "Black Pepper Chicken",
    image: "/images/black-pepper-chicken.jpg",
    description:
      "Marinated chicken, celery and onions in a bold black pepper sauce.",
    calories: "280",
    type: "entree",
  },
  {
    name: "Black Pepper Sirloin Steak",
    image: "/images/black-pepper-steak.jpg",
    description:
      "Premium Angus steak wok-seared with baby broccoli, onions, and mushrooms in a savory black pepper sauce.",
    calories: "450",
    type: "entree",
  },
  {
    name: "Hot Ones Blazing Bourbon Chicken",
    image: "/images/bourbon-chicken.jpg",
    description:
      "Chicken breast pieces wok-fired in a signature bourbon sauce.",
    calories: "460",
    type: "entree",
  },
  {
    name: "Broccoli Beef",
    image: "/images/brocolli-beef.jpg",
    description: "Tender beef and fresh broccoli in a ginger soy sauce.",
    calories: "150",
    type: "entree",
  },
  {
    name: "Mushroom Chicken",
    image: "/images/mushroom-chicken.jpg",
    description:
      "Light and savory chicken with mushrooms, zucchini and carrots in a ginger soy sauce.",
    calories: "220",
    type: "entree",
  },
  {
    name: "String Bean Chicken Breast",
    image: "/images/string-bean-chicken-breast.jpg",
    description:
      "Chicken breast, string beans and onions wok-tossed in a mild ginger soy sauce.",
    calories: "190",
    type: "entree",
  },
  {
    name: "SweetFire Chicken Breast",
    image: "/images/sweetfire-chicken-breast.jpg",
    description:
      "Crispy white meat chicken, red bell peppers, onions and pineapples in a sweet and spicy sauce.",
    calories: "380",
    type: "entree",
  },
  {
    name: "Honey Sesame Chicken Breast",
    image: "/images/honey-sesame-chicken-breast.jpg",
    description:
      "Crispy chicken breast strips tossed with fresh string beans and yellow bell peppers in a sweet honey sesame sauce.",
    calories: "420",
    type: "entree",
  },
  {
    name: "Kung Pao Chicken",
    image: "/images/kung-pao-chicken.jpg",
    description:
      "A Szechwan-inspired dish with chicken, peanuts, vegetables and chili peppers.",
    calories: "290",
    type: "entree",
  },
  {
    name: "Teriyaki Chicken",
    image: "/images/teriyaki-chicken.jpg",
    description:
      "Grilled chicken thigh hand-sliced to order and served with teriyaki sauce.",
    calories: "300",
    type: "entree",
  },
  {
    name: "Honey Walnut Shrimp",
    image: "/images/walnut-shrimp.jpg",
    description:
      "Large tempura-battered shrimp, wok-tossed in a honey sauce and topped with glazed walnuts.",
    calories: "510",
    type: "entree",
  },
];

const MenuCarousel = ({ items }: { items: MenuItem[] }) => {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {items.map((item) => (
          <CarouselItem key={item.name} className="pl-2 md:pl-4 md:basis-1/3">
            <Card className="border-0 bg-zinc-900 overflow-hidden shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl">
              <div className="relative h-52">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <CardHeader className="text-center">
                <h3 className="text-xl font-frutiger font-bold text-white">
                  {item.name}
                </h3>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-amber-500 font-medium">
                  {item.calories} calories
                </p>
              </CardFooter>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
};

const Weather = () => {
  const [weather, setWeather] = useState<string | null>(null);
  const [icon, setIcon] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather`,
          {
            params: {
              lat,
              lon,
              appid: apiKey,
              units: "metric",
            },
          }
        );
        const data = response.data as {
          main: { temp: number };
          weather: { description: string; icon: string }[];
        };

        const temp = data.main.temp * (9 / 5) + 32;
        const condition = data.weather[0].description;
        const iconCode = data.weather[0].icon;

        // Set the weather text and icon
        setWeather(
          `${temp.toFixed(1)}°F, ${
            condition.charAt(0).toUpperCase() + condition.slice(1)
          }`
        );
        setIcon(`http://openweathermap.org/img/wn/${iconCode}@2x.png`);
      } catch (error) {
        console.error("Error fetching weather:", error);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
        },
        (error) => console.error("Error getting location:", error)
      );
    }
  }, []);

  return (
    <div className="flex items-center text-white ml-4">
      {icon && <img src={icon} alt="Weather icon" className="w-8 h-8 mr-2" />}
      {weather ? weather : "Loading weather..."}
    </div>
  );
};

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    setMounted(true);
    setMenuItems(menuItemsData);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-black"></div>;
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <div className="absolute top-0 w-full z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="container mx-auto flex justify-between items-center py-4 px-4">
          <div className="flex gap-4">
            <Image
              src="/images/panda-logo.png"
              alt="Panda Express Logo"
              width={140}
              height={46}
              className="object-contain"
              priority
            />
            <GoogleTranslate />
          </div>
          <div className="flex gap-4">
            <Weather />
            <Link href="/customer/login" prefetch>
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-orange-500 hover:border-orange-600"
              >
                For Customers
              </Button>
            </Link>
            <Link href="/login" prefetch>
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-orange-500 hover:border-orange-600"
              >
                Employee Login Portal
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[40vh] mb-12">
        <Image
          src="/images/hero-orange-chicken.jpg"
          alt="Panda Express Hero"
          fill
          className="object-cover brightness-75"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-white drop-shadow-lg tracking-tight font-frutiger">
            Delicious Menu Highlights
          </h1>
        </div>
      </div>

      {/* Menu Images Section */}
      <div className="container mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative h-[300px] rounded-lg overflow-hidden group">
            <Image
              src="/images/entree_menu.jpg"
              alt="Entree Menu"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-4 left-4">
              <h2 className="text-2xl font-bold text-white">Entree Menu</h2>
            </div>
          </div>
          <div className="relative h-[300px] rounded-lg overflow-hidden group">
            <Image
              src="/images/sides_menu.jpeg"
              alt="Sides Menu"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-4 left-4">
              <h2 className="text-2xl font-bold text-white">Sides Menu</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Carousel */}
      <div className="container mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Featured Entrees
        </h2>
        <MenuCarousel items={menuItems} />
      </div>
    </main>
  );
}
