import Link from "next/link";
import ImageWithFallback from "../components/ImageWithFallback";

export default function Home() {
  const menuItems = [
    {
      name: 'The Original Orange Chicken®',
      image: '/images/orange-chicken.jpg',
      description: 'Our signature dish. Crispy chicken wok-tossed in a sweet and spicy orange sauce.',
    },
    {
      name: 'Beijing Beef',
      image: '/images/beijing-beef.jpg',
      description: 'Crispy beef, bell peppers and onions in a sweet-tangy sauce.',
    },
    {
      name: 'Chow Mein',
      image: '/images/chow-mein.jpg',
      description: 'Stir-fried wheat noodles with onions, celery and cabbage.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-black text-white py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-4">
          <ImageWithFallback
          src="/images/panda-logo.png"

          alt="Panda Express Logo"
          width={150}
          height={50}
          priority
          className="object-contain"
        />
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/menu" 
              className="hover:text-orange-500 transition-colors font-semibold"
            >
              Order Online
            </Link>
            <Link 
              href="/menu" 
              className="hover:text-orange-500 transition-colors font-semibold"
            >
              Menu
            </Link>
            <Link 
              href="/locations" 
              className="hover:text-orange-500 transition-colors font-semibold"
            >
              Locations
            </Link>
            <Link 
              href="/employee-login"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition-colors font-semibold"
            >
              Employee Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[600px]">
      <ImageWithFallback
      src="/images/hero-orange-chicken.jpg"
      alt="Orange Chicken"
      fill
      priority
      className="object-cover brightness-75"
    />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-6xl font-bold mb-6">
              AMERICAN CHINESE KITCHEN
            </h1>
            <p className="text-2xl mb-8 max-w-2xl mx-auto">
              Experience the bold flavors of Panda Express
            </p>
            <Link 
              href="/order-now"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full text-xl font-semibold transition-colors inline-block"
            >
              Order Now
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Menu Items */}
      <div className="max-w-7xl mx-auto py-20 px-4">
        <h2 className="text-3xl font-bold text-center mb-16">Featured Dishes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {menuItems.map((item) => (
            <div key={item.name} className="rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105">
              <div className="h-64 relative">
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  fill
                  loading="lazy"
                  className="object-cover"
                />
              </div>
              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <Link 
                  href="/menu"
                  className="text-red-600 hover:text-red-700 font-semibold inline-flex items-center"
                >
                  Order Now <span className="ml-2">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">Menu</h3>
              <ul className="space-y-2">
                <li><Link href="/menu" className="hover:text-orange-500">Entrées</Link></li>
                <li><Link href="/menu" className="hover:text-orange-500">Sides</Link></li>
                <li><Link href="/menu" className="hover:text-orange-500">Appetizers</Link></li>
                <li><Link href="/menu" className="hover:text-orange-500">Family Meals</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-orange-500">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-orange-500">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-orange-500">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-orange-500">Facebook</Link></li>
                <li><Link href="#" className="hover:text-orange-500">Instagram</Link></li>
                <li><Link href="#" className="hover:text-orange-500">Twitter</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Get Updates</h3>
              <p className="mb-4">Sign up for exclusive offers and updates</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email address"
                  className="px-4 py-2 rounded-full flex-grow text-black"
                />
                <button className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-full transition-colors">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} Panda Express. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}