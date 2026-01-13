import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#E5DCC3] pt-16 pb-8 px-6 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-1">
          <h2 className="text-2xl font-serif font-bold text-[#4A3728] mb-4">
            LuminaBooks
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your personal sanctuary for reading, tracking, and discovering new
            worlds. Join our community of book lovers today.
          </p>
        </div>

        <div>
          <h4 className="font-black uppercase text-[10px] tracking-widest text-gray-400 mb-6">
            Quick Access
          </h4>
          <ul className="space-y-3 text-sm font-bold text-[#4A3728]/80">
            <li>
              <Link href="/browse">Browse Catalog</Link>
            </li>
            <li>
              <Link href="/library">My Shelves</Link>
            </li>
            <li>
              <Link href="/tutorials">Learning Hub</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-black uppercase text-[10px] tracking-widest text-gray-400 mb-6">
            Community
          </h4>
          <ul className="space-y-3 text-sm font-bold text-[#4A3728]/80">
            <li>
              <a href="#">Reading Clubs</a>
            </li>
            <li>
              <a href="#">Top Reviewers</a>
            </li>
            <li>
              <a href="#">Events</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-black uppercase text-[10px] tracking-widest text-gray-400 mb-6">
            Socials
          </h4>
          <div className="flex gap-4 text-xl">
            <a href="#" className="hover:text-[#C1A88D]">
              🐦
            </a>
            <a href="#" className="hover:text-[#C1A88D]">
              📸
            </a>
            <a href="#" className="hover:text-[#C1A88D]">
              📘
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">
          © 2026 LuminaBooks Management System. All Rights Reserved.
        </p>
        <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
