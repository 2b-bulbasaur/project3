"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

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
    image: "/images/the-original-orange-chicken.png",
    description:
      "Our signature dish. Crispy chicken wok-tossed in a sweet and spicy orange sauce.",
    calories: "490",
    type: "entree",
  },
  {
    name: "Beijing Beef",
    image: "/images/beijing-beef.png",
    description: "Crispy beef, bell peppers and onions in a sweet-tangy sauce.",
    calories: "470",
    type: "entree",
  },
  {
    name: "Black Pepper Chicken",
    image: "/images/black-pepper-chicken.png",
    description:
      "Marinated chicken, celery and onions in a bold black pepper sauce.",
    calories: "280",
    type: "entree",
  },
  {
    name: "Black Pepper Sirloin Steak",
    image: "/images/black-pepper-sirloin-steak.png",
    description:
      "Premium Angus steak wok-seared with baby broccoli, onions, and mushrooms in a savory black pepper sauce.",
    calories: "450",
    type: "entree",
  },
  {
    name: "Hot Ones Blazing Bourbon Chicken",
    image: "/images/hot-ones-blazing-bourbon-chicken.png",
    description:
      "Chicken breast pieces wok-fired in a signature bourbon sauce.",
    calories: "460",
    type: "entree",
  },
  {
    name: "Broccoli Beef",
    image: "/images/broccoli-beef.png",
    description: "Tender beef and fresh broccoli in a ginger soy sauce.",
    calories: "150",
    type: "entree",
  },
  {
    name: "Mushroom Chicken",
    image: "/images/mushroom-chicken.png",
    description:
      "Light and savory chicken with mushrooms, zucchini and carrots in a ginger soy sauce.",
    calories: "220",
    type: "entree",
  },
  {
    name: "String Bean Chicken Breast",
    image: "/images/string-bean-chicken-breast.png",
    description:
      "Chicken breast, string beans and onions wok-tossed in a mild ginger soy sauce.",
    calories: "190",
    type: "entree",
  },
  {
    name: "SweetFire Chicken Breast",
    image: "/images/sweetfire-chicken-breast.png",
    description:
      "Crispy white meat chicken, red bell peppers, onions and pineapples in a sweet and spicy sauce.",
    calories: "380",
    type: "entree",
  },
  {
    name: "Honey Sesame Chicken Breast",
    image: "/images/honey-sesame-chicken-breast.png",
    description:
      "Crispy chicken breast strips tossed with fresh string beans and yellow bell peppers in a sweet honey sesame sauce.",
    calories: "420",
    type: "entree",
  },
  {
    name: "Kung Pao Chicken",
    image: "/images/kung-pao-chicken.png",
    description:
      "A Szechwan-inspired dish with chicken, peanuts, vegetables and chili peppers.",
    calories: "290",
    type: "entree",
  },
  {
    name: "Teriyaki Chicken",
    image: "/images/grilled-teriyaki-chicken.png",
    description:
      "Grilled chicken thigh hand-sliced to order and served with teriyaki sauce.",
    calories: "300",
    type: "entree",
  },
  {
    name: "Honey Walnut Shrimp",
    image: "/images/honey-walnut-shrimp.png",
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

const sidesData: MenuBoardItem[] = [
  {
    name: "Chow Mein",
    image: "/images/chow-mein.png",
    description: "Stir-fried wheat noodles with onions, celery and cabbage",
    calories: "510",
    type: "side",
  },
  {
    name: "White Steamed Rice",
    image: "/images/white-rice.png",
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
];

const MenuCarousel = ({ items }: { items: MenuBoardItem[] }) => {
  const [speaking, setSpeaking] = useState<string | null>(null);
  const speak = (text: string, itemName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    window.speechSynthesis.cancel();

    if (speaking === itemName) {
      setSpeaking(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeaking(null);
    window.speechSynthesis.speak(utterance);
    setSpeaking(itemName);
  };
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

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
            <Card className="border border-white bg-zinc-900 overflow-hidden shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl h-full">


              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain p-4 z-0"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"/>
                <button
                  onClick={(e) =>
                    speak(
                      `${item.name}. ${item.description}. ${item.calories} calories.`,
                      item.name,
                      e
                    )
                  }
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-20"
                  aria-label={speaking === item.name ? "Stop speaking" : "Read aloud"}
                >
                  {speaking === item.name ? (
                    <VolumeX className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-gray-400 hover:text-amber-500" />
                  )}
                </button>
                
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
      <CarouselPrevious className="flex [&>svg]:inline [&>svg]:text-black" />
      <CarouselNext className="flex [&>svg]:inline [&>svg]:text-black" />
    </Carousel>
  );
};

export default function MenuBoard() {
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"entree" | "side">("entree");

  useEffect(() => {
    setMounted(true);
    // Clean up any ongoing speech when page unmounts
    return () => {
      window.speechSynthesis.cancel();
    };
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
          <div className="flex items-center gap-4">
            <Link
              href="../"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors border border-white/50"
            >
              Device Setup
            </Link>
            <Weather />
          </div>
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
            className={`px-6 py-3 rounded-lg text-lg font-bold transition-colors border border-white/50 ${
              activeMenu === "entree"
                ? "bg-amber-500 text-white"
                : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
            }`}
          >
            Entree Menu
          </button>
          <button
            onClick={() => setActiveMenu("side")}
            className={`px-6 py-3 rounded-lg text-lg font-bold transition-colors border border-white/50 ${
              activeMenu === "side"
                ? "bg-amber-500 text-white"
                : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
            }`}
          >
            Sides Menu
          </button>
        </div>

        <div className="container mx-auto px-4 pb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {activeMenu === "entree" ? "Entrees" : "Sides"}
          </h2>
          <MenuCarousel
            items={activeMenu === "entree" ? menuItemsData : sidesData}
          />
        </div>
      </div>
    </main>
  );
}