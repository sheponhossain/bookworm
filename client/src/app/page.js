/* eslint-disable @next/next/no-img-element */
'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3728] overflow-x-hidden">
      {/* --- Hero Section --- */}
      <section className="relative max-w-7xl mx-auto px-8 pt-20 pb-32 flex flex-col lg:flex-row items-center justify-between gap-16">
        {/* Left Content */}
        <div className="flex-1 space-y-8 text-center lg:text-left z-10">
          <div className="inline-block px-4 py-1 bg-[#C1A88D]/10 rounded-full">
            <span className="text-[10px] font-black uppercase tracking-[3px] text-[#C1A88D]">
              Est. 2024 • The Digital Archive
            </span>
          </div>

          <h1 className="text-7xl md:text-8xl font-serif font-bold leading-[0.9]">
            Read the <br />
            <span className="italic text-[#C1A88D]">Unwritten.</span>
          </h1>

          <p className="max-w-lg text-lg text-gray-400 font-medium leading-relaxed">
            Welcome to BOOKWORM. A sanctuary for seekers of wisdom and
            collectors of stories. Explore our curated digital library and build
            your personal sanctuary.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Link
              href="/browse"
              className="bg-[#4A3728] text-white px-10 py-5 rounded-2xl font-bold shadow-2xl hover:scale-105 transition-all"
            >
              Explore Library
            </Link>
            {!user && (
              <Link
                href="/auth/login"
                className="px-10 py-5 rounded-2xl font-bold border border-[#E5DCC3] hover:bg-white transition-all"
              >
                Join the Club
              </Link>
            )}
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 opacity-40">
            <div className="text-center">
              <p className="text-2xl font-serif font-bold">12k+</p>
              <p className="text-[10px] uppercase font-black tracking-widest">
                Titles
              </p>
            </div>
            <div className="h-8 w-[1px] bg-[#4A3728]"></div>
            <div className="text-center">
              <p className="text-2xl font-serif font-bold">5k+</p>
              <p className="text-[10px] uppercase font-black tracking-widest">
                Readers
              </p>
            </div>
          </div>
        </div>

        {/* Right Visual - Floating Book Design */}
        <div className="flex-1 relative">
          <div className="relative w-72 h-[450px] md:w-80 md:h-[500px] mx-auto z-20 transform rotate-6 hover:rotate-0 transition-transform duration-700">
            <img
              src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1974&auto=format&fit=crop"
              className="w-full h-full object-cover rounded-[40px] shadow-[30px_30px_60px_rgba(0,0,0,0.1)]"
              alt="Hero Book"
            />
            {/* Floating Card 1 */}
            <div className="absolute -left-16 top-20 bg-white p-4 rounded-3xl shadow-xl animate-bounce duration-[3000ms] hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  ✅
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase">
                    Finish Read
                  </p>
                  <p className="text-xs italic text-gray-400 font-serif">
                    Clean Code
                  </p>
                </div>
              </div>
            </div>
            {/* Floating Card 2 */}
            <div className="absolute -right-10 bottom-20 bg-white p-4 rounded-3xl shadow-xl animate-pulse hidden md:block">
              <p className="text-[10px] font-black uppercase text-[#C1A88D]">
                New Arrival
              </p>
              <p className="text-sm font-bold">React Architecture</p>
            </div>
          </div>
          {/* Background Decorative Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#C1A88D]/5 rounded-full blur-3xl -z-10"></div>
        </div>
      </section>

      {/* --- Featured Categories --- */}
      <section className="bg-white py-24 rounded-t-[80px] shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-serif font-bold">
                Browse by <span className="italic text-[#C1A88D]">Genre</span>
              </h2>
              <p className="text-gray-400 font-medium">
                Find your specific taste
              </p>
            </div>
            <Link
              href="/browse"
              className="text-sm font-black uppercase tracking-widest border-b-2 border-[#4A3728]"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Classic', 'Fiction', 'Technology', 'Philosophy'].map(
              (cat, i) => (
                <div
                  key={i}
                  className="group bg-[#FDFBF7] p-10 rounded-[40px] text-center hover:bg-[#4A3728] hover:text-white transition-all duration-500 cursor-pointer"
                >
                  <p className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                    {i === 0 ? '📜' : i === 1 ? '✨' : i === 2 ? '💻' : '🏛️'}
                  </p>
                  <h3 className="text-lg font-bold">{cat}</h3>
                  <p className="text-[10px] uppercase tracking-widest opacity-40">
                    Explore Collection
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
