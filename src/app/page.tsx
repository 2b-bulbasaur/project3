// src/app/page.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

type MenuItem = {
  name: string
  image: string
  description: string
  calories: string
  type: 'entree' | 'side'
}

const menuItems: MenuItem[] = [
  {
    name: "The Original Orange Chicken®",
    image: "/images/orange-chicken.jpg",
    description: "Our signature dish. Crispy chicken wok-tossed in a sweet and spicy orange sauce.",
    calories: "490",
    type: "entree"
  },
  {
    name: "Beijing Beef",
    image: "/images/beijing-beef.jpg",
    description: "Crispy beef, bell peppers and onions in a sweet-tangy sauce.",
    calories: "470",
    type: "entree"
  },
  {
    name: "Black Pepper Chicken",
    image: "/images/black-pepper-chicken.jpg",
    description: "Marinated chicken, celery and onions in a bold black pepper sauce.",
    calories: "280",
    type: "entree"
  },
  {
    name: "Black Pepper Angus Steak",
    image: "/images/black-pepper-steak.jpg",
    description: "Premium Angus steak wok-seared with baby broccoli, onions, and mushrooms in a savory black pepper sauce.",
    calories: "450",
    type: "entree"
  },
  {
    name: "Bourbon Chicken",
    image: "/images/bourbon-chicken.jpg",
    description: "Chicken breast pieces wok-fired in a signature bourbon sauce.",
    calories: "460",
    type: "entree"
  },
  {
    name: "Broccoli Beef",
    image: "/images/brocolli-beef.jpg",
    description: "Tender beef and fresh broccoli in a ginger soy sauce.",
    calories: "150",
    type: "entree"
  },
  {
    name: "Mushroom Chicken",
    image: "/images/mushroom-chicken.jpg",
    description: "Light and savory chicken with mushrooms, zucchini and carrots in a ginger soy sauce.",
    calories: "220",
    type: "entree"
  },
  {
    name: "String Bean Chicken Breast",
    image: "/images/string-bean-chicken-breast.jpg",
    description: "Chicken breast, string beans and onions wok-tossed in a mild ginger soy sauce.",
    calories: "190",
    type: "entree"
  },
  {
    name: "SweetFire Chicken Breast®",
    image: "/images/sweetfire-chicken-breast.jpg",
    description: "Crispy white meat chicken, red bell peppers, onions and pineapples in a sweet and spicy sauce.",
    calories: "380",
    type: "entree"
  },
  {
    name: "Honey Sesame Chicken Breast",
    image: "/images/honey-sesame-chicken-breast.jpg",
    description: "Crispy chicken breast strips tossed with fresh string beans and yellow bell peppers in a sweet honey sesame sauce.",
    calories: "420",
    type: "entree"
  },
  {
    name: "Kung Pao Chicken",
    image: "/images/kung-pao-chicken.jpg",
    description: "A Szechwan-inspired dish with chicken, peanuts, vegetables and chili peppers.",
    calories: "290",
    type: "entree"
  },
  {
    name: "Teriyaki Chicken",
    image: "/images/teriyaki-chicken.jpg",
    description: "Grilled chicken thigh hand-sliced to order and served with teriyaki sauce.",
    calories: "300",
    type: "entree"
  },
  {
    name: "Walnut Shrimp",
    image: "/images/walnut-shrimp.jpg",
    description: "Large tempura-battered shrimp, wok-tossed in a honey sauce and topped with glazed walnuts.",
    calories: "510",
    type: "entree"
  }
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* header with logo and logout/sudtomer button*/}
      <div className="absolute top-0 w-full z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="container mx-auto flex justify-between items-center py-4 px-4">
          <div className="flex-shrink-0">
            <Image 
              src="/images/panda-logo.png" 
              alt="Panda Express Logo" 
              width={180} 
              height={60}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex gap-4">

            <Link href="/customer" prefetch>
              <Button 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 text-white border-orange-500 hover:border-orange-600 transition-all"
              >
                For Customers
              </Button>
            </Link>


          <Link href="/login" prefetch>
            <Button 
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 text-white border-orange-500 hover:border-orange-600 transition-all"
            >
              Employee Login Portal
            </Button>
          </Link>
        </div>
      </div>
    </div>

      {/* Large Panda Express Image Section */}
      <div className="relative h-[40vh] mb-8">
        <Image
          src="/images/hero-orange-chicken.jpg"
          alt="Panda Express Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black flex items-center justify-center">
          <h1 className="text-6xl font-bold text-center text-white drop-shadow-lg">
            Delicious Menu Highlights
          </h1>
        </div>
      </div>

      {/* menu grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item) => (
            <div 
              key={item.name} 
              className="bg-zinc-900 rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-[1.02]"
            >
              <div className="relative h-48">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                <p className="text-gray-400 text-sm mb-2">{item.description}</p>
                <p className="text-amber-500">{item.calories} calories</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

