// src/app/menu-board/page.tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
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

type MenuBoardItem = {
  name: string;
  image: string;
  description: string;
  calories: string;
  type: "entree" | "side";
};

const menuItemsData: MenuBoardItem[] = [
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
      {icon && (
        <Image
          src={icon}
          alt="Weather icon"
          width={32}
          height={32}
          className="mr-2"
        />
      )}
      {weather ? weather : "Loading weather..."}
    </div>
  );
};

const MenuCarousel = ({ items }: { items: MenuBoardItem[] }) => {
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

export default function MenuBoard() {
  const [mounted, setMounted] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuBoardItem[]>([]);
  const [activeMenu, setActiveMenu] = useState<"entree" | "side">("entree");

  useEffect(() => {
    setMounted(true);
    setMenuItems(menuItemsData);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-black"></div>;
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="w-full bg-gradient-to-b from-black/80 to-transparent">
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
          <Weather />
        </div>
      </div>

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
            Our Menu
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 mb-16">
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveMenu("entree")}
            className={`px-6 py-3 rounded-lg text-lg font-bold transition-colors ${
              activeMenu === "entree"
                ? "bg-amber-500 text-white"
                : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
            }`}
          >
            Entree Menu
          </button>
          <button
            onClick={() => setActiveMenu("side")}
            className={`px-6 py-3 rounded-lg text-lg font-bold transition-colors ${
              activeMenu === "side"
                ? "bg-amber-500 text-white"
                : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
            }`}
          >
            Sides Menu
          </button>
        </div>

        {activeMenu === "entree" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems
              .filter((item) => item.type === "entree")
              .map((item) => (
                <Card
                  key={item.name}
                  className="border-0 bg-zinc-900 overflow-hidden shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
                >
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
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Chow Mein",
                image: "/images/chow-mein.png",
                description:
                  "Stir-fried wheat noodles with onions, celery and cabbage",
                calories: "510",
                type: "side",
              },
              {
                name: "White Steamed Rice",
                image: "/images/white-steamed-rice.png",
                description: "Steamed white rice",
                calories: "380",
                type: "side",
              },
              {
                name: "Fried Rice",
                image: "/images/fried-rice.png",
                description:
                  "Prepared steamed white rice with soy sauce, eggs, peas, carrots and green onions",
                calories: "520",
                type: "side",
              },
              {
                name: "Super Greens",
                image: "/images/super-greens.png",
                description: "A hot blend of broccoli, kale, and cabbage",
                calories: "90",
                type: "side",
              },
            ].map((item) => (
              <Card
                key={item.name}
                className="border-0 bg-zinc-900 overflow-hidden shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
              >
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
            ))}
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Featured Entrees
        </h2>
        <MenuCarousel items={menuItems} />
      </div>
    </main>
  );
}
