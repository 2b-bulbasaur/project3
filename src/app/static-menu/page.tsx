"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const StaticMenuBoard = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-black"></div>;
  }

  const menuItems = {
    entrees: [
      {
        name: "The Original Orange Chicken",
        calories: "490",
        description:
          "Our signature dish. Crispy chicken wok-tossed in a sweet and spicy orange sauce.",
      },
      {
        name: "Beijing Beef",
        calories: "470",
        description:
          "Crispy beef, bell peppers and onions in a sweet-tangy sauce.",
      },
      {
        name: "Black Pepper Chicken",
        calories: "280",
        description:
          "Marinated chicken, celery and onions in a bold black pepper sauce.",
      },
      {
        name: "Broccoli Beef",
        calories: "150",
        description: "Tender beef and fresh broccoli in a ginger soy sauce.",
      },
      {
        name: "Mushroom Chicken",
        calories: "220",
        description:
          "Light and savory chicken with mushrooms, zucchini and carrots.",
      },
      {
        name: "String Bean Chicken Breast",
        calories: "190",
        description:
          "Chicken breast and string beans wok-tossed in a mild ginger soy sauce.",
      },
      {
        name: "SweetFire Chicken Breast",
        calories: "380",
        description:
          "Crispy white meat chicken, red bell peppers, onions and pineapples in a sweet and spicy sauce.",
      },
      {
        name: "Honey Sesame Chicken Breast",
        calories: "420",
        description:
          "Crispy chicken breast strips with string beans in a sweet honey sesame sauce.",
      },
      {
        name: "Kung Pao Chicken",
        calories: "290",
        description:
          "A Szechwan-inspired dish with chicken, peanuts, vegetables and chili peppers.",
      },
      {
        name: "Honey Walnut Shrimp",
        calories: "510",
        description:
          "Large tempura-battered shrimp, wok-tossed in a honey sauce and topped with glazed walnuts.",
      },
    ],
    sides: [
      {
        name: "Chow Mein",
        calories: "510",
        description: "Stir-fried wheat noodles with onions, celery and cabbage",
      },
      {
        name: "White Steamed Rice",
        calories: "380",
        description: "Steamed white rice",
      },
      {
        name: "Fried Rice",
        calories: "520",
        description:
          "Prepared steamed white rice with soy sauce, eggs, peas, carrots and green onions",
      },
      {
        name: "Super Greens",
        calories: "90",
        description: "A hot blend of broccoli, kale, and cabbage",
      },
    ],
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="w-full bg-gradient-to-b from-black/80 to-transparent">
        <div className="container mx-auto flex justify-between items-center py-4 px-4">
          <Image
            src="/images/panda-logo.png"
            alt="Panda Express Logo"
            width={200}
            height={66}
            className="object-contain"
            priority
          />
          <Link
            href="../"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors border border-white/50"
          >
            Device Setup
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 p-8">
        {/* Entrees Column */}
        <div className="bg-zinc-900 rounded-lg p-6 border border-white/20">
          <h2 className="text-4xl font-bold mb-8 text-amber-500 text-center">
            Entrees
          </h2>
          <div className="space-y-6">
            {menuItems.entrees.map((item) => (
              <div
                key={item.name}
                className="border-b border-white/10 pb-4 last:border-0"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-bold text-white">{item.name}</h3>
                  <span className="text-amber-500 text-xl">
                    {item.calories} cal
                  </span>
                </div>
                <p className="text-gray-400 mt-2 text-lg">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sides Column */}
        <div className="bg-zinc-900 rounded-lg p-6 border border-white/20">
          <h2 className="text-4xl font-bold mb-8 text-amber-500 text-center">
            Sides
          </h2>
          <div className="space-y-6">
            {menuItems.sides.map((item) => (
              <div
                key={item.name}
                className="border-b border-white/10 pb-4 last:border-0"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-bold text-white">{item.name}</h3>
                  <span className="text-amber-500 text-xl">
                    {item.calories} cal
                  </span>
                </div>
                <p className="text-gray-400 mt-2 text-lg">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default StaticMenuBoard;
