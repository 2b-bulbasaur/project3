// src/app/page.tsx
'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
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
  // ... rest of your menu items
]

export default function HomePage() {  // Changed name since it's the root page
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/login');  // Updated to point to the login page
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header with Logo and Login */}
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
          <Button 
            variant="outline" 
            className="bg-white/10 hover:bg-white/20 text-white border-orange-500 hover:border-orange-600 transition-all"
            onClick={handleLoginClick}
          >
            Employee Login Portal
          </Button>
        </div>
      </div>

      {/* Hero Section */}
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
            Delicious Entrees
          </h1>
        </div>
      </div>

      {/* Menu Grid */}
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