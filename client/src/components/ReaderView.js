'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function ReaderView({ book, onBack, onShelfChange }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [fontSize, setFontSize] = useState(18);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ১. লোকাল স্টোরেজ থেকে সেভ করা প্রগ্রেস লোড করা
  const [unlockedPages, setUnlockedPages] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`progress_${book._id}`);
      return saved ? parseInt(saved) : 1;
    }
    return 1;
  });

  const [secondsRead, setSecondsRead] = useState(0);

  const totalPages = book.totalPages || 100;
  const progressPercent = Math.round((unlockedPages / totalPages) * 100);

  // ২. প্রগ্রেস সেভ করা এবং 'Read' শেলফে পাঠানো
  useEffect(() => {
    localStorage.setItem(`progress_${book._id}`, unlockedPages);

    // যদি সব পেজ আনলক হয়ে যায়, অটোমেটিক 'Read' শেলফে মুভ করবে
    if (unlockedPages >= totalPages) {
      if (onShelfChange) onShelfChange(book._id, 'Read');
    }
  }, [unlockedPages, book._id, onShelfChange, totalPages]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRead((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPg = currentPage + 1;
      setCurrentPage(nextPg);
      if (nextPg > unlockedPages) {
        setUnlockedPages(nextPg);
        if (nextPg === totalPages) {
          toast.success("Congratulations! You've finished the book. ✨");
        }
      }
    }
  };

  useEffect(() => {
    const mainArea = document.getElementById('reader-content');
    if (mainArea) mainArea.scrollTo(0, 0);
  }, [currentPage]);

  return (
    <div
      className={`fixed inset-0 z-[500] flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#1a1a1a] text-gray-200' : 'bg-[#FDFBF7] text-[#4A3728]'}`}
    >
      <nav
        className={`h-16 border-b flex items-center justify-between px-8 ${isDarkMode ? 'border-gray-800 bg-[#252525]' : 'border-[#E5DCC3] bg-white shadow-sm'}`}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-70 hover:opacity-100 transition-all"
        >
          <span className="text-lg">←</span> Exit Reader
        </button>
        <div className="flex items-center gap-8">
          <h2 className="hidden md:block font-serif italic font-bold">
            {book.title}
          </h2>
          <div className="flex items-center gap-4 border-l pl-8 border-gray-300">
            <button
              onClick={() => setFontSize((prev) => Math.max(12, prev - 2))}
              className="hover:text-[#C1A88D]"
            >
              A-
            </button>
            <span className="text-xs font-mono">{fontSize}px</span>
            <button
              onClick={() => setFontSize((prev) => Math.min(32, prev + 2))}
              className="hover:text-[#C1A88D]"
            >
              A+
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`ml-4 p-2 rounded-full ${isDarkMode ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-white'}`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`w-72 border-r hidden lg:block overflow-y-auto no-scrollbar p-6 ${isDarkMode ? 'border-gray-800 bg-[#1e1e1e]' : 'border-[#E5DCC3] bg-[#F9F6F0]'}`}
        >
          <p className="text-[9px] font-black uppercase tracking-[3px] opacity-40 mb-6">
            Table of Contents
          </p>
          <div className="space-y-1">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              const isLocked = pageNum > unlockedPages;
              const isCompleted = pageNum < unlockedPages;
              const isActive = currentPage === pageNum;

              return (
                <button
                  key={i}
                  disabled={isLocked}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium transition-all flex justify-between items-center group
                    ${
                      isActive
                        ? 'bg-[#C1A88D] text-white shadow-lg translate-x-1'
                        : `hover:translate-x-1 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-white'}`
                    } 
                    ${isLocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  <span className="flex items-center gap-3">
                    {isCompleted ? (
                      <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                    ) : (
                      <span
                        className={`w-5 h-5 rounded-full border-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                      />
                    )}
                    Page {String(pageNum).padStart(2, '0')}
                  </span>
                  {isLocked && (
                    <span className="text-[10px] opacity-50">🔒</span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        <main
          id="reader-content"
          className="flex-1 overflow-y-auto p-6 md:p-16 scroll-smooth"
        >
          <div
            className={`max-w-3xl mx-auto shadow-2xl rounded-[40px] p-8 md:p-20 min-h-[120vh] transition-all relative ${isDarkMode ? 'bg-[#252525] border-gray-800' : 'bg-white border-[#E5DCC3] border'}`}
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
          >
            <span className="text-[10px] text-[#C1A88D] font-bold tracking-[4px] uppercase mb-10 block">
              Chapter {Math.ceil(currentPage / 10)}
            </span>
            <h1 className="text-4xl font-serif font-bold mb-12 border-b pb-6 italic">
              The Eternal Silence
            </h1>
            <p className="font-serif mb-12">
              This is the content for page {currentPage}.
              <br />
              <br />
              "The stars didn't look like diamonds; they looked like the cold,
              hard eyes of a god who had forgotten he ever created us."
            </p>

            <div className="mt-20 flex justify-center border-t pt-10">
              <button
                onClick={handleNextPage}
                className={`bg-[#C1A88D] text-white px-12 py-4 rounded-full font-bold text-sm tracking-widest hover:shadow-xl transition-all active:scale-95 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {currentPage === totalPages
                  ? 'Finish Reading'
                  : 'Unlock Next Page →'}
              </button>
            </div>
          </div>
        </main>

        <aside
          className={`w-80 border-l hidden xl:flex flex-col items-center p-10 ${isDarkMode ? 'border-gray-800 bg-[#1e1e1e]' : 'border-[#E5DCC3] bg-[#F9F6F0]'}`}
        >
          <p className="text-[9px] font-black uppercase tracking-[3px] opacity-40 mb-12">
            Live Analytics
          </p>

          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="75"
                stroke={isDarkMode ? '#333' : '#E5DCC3'}
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="88"
                cy="88"
                r="75"
                stroke="#C1A88D"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={471}
                strokeDashoffset={471 - (471 * progressPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-bold">{progressPercent}%</span>
              <span className="text-[8px] uppercase tracking-widest opacity-50">
                Unlocked
              </span>
            </div>
          </div>

          <div className="w-full mt-12 space-y-4">
            <div
              className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#252525] border-gray-800' : 'bg-white border-[#E5DCC3]'}`}
            >
              <p className="text-[9px] opacity-50 font-bold uppercase mb-1 text-[#C1A88D]">
                Live Reading Time
              </p>
              <p className="text-lg font-serif font-bold font-mono">
                {formatTime(secondsRead)}
              </p>
            </div>
            <div
              className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#252525] border-gray-800' : 'bg-white border-[#E5DCC3]'}`}
            >
              <p className="text-[9px] opacity-50 font-bold uppercase mb-1">
                Locked Pages
              </p>
              <p className="text-lg font-serif font-bold">
                {totalPages - unlockedPages} Left
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
