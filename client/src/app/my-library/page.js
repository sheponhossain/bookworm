/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import ReaderView from '@/components/ReaderView';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function MyLibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [savedBooks, setSavedBooks] = useState([]);
  const [dbStats, setDbStats] = useState({ annualGoal: 50, readingStreak: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const statusOptions = ['Want to Read', 'Currently Reading', 'Read'];

  const stats = useMemo(() => {
    const readBooks = savedBooks.filter((b) => b.status === 'Read');
    const currentlyReading = savedBooks.filter(
      (b) => b.status === 'Currently Reading'
    );

    const annualGoal = dbStats.annualGoal || 50;
    const progress = Math.min(
      Math.round((readBooks.length / annualGoal) * 100),
      100
    );

    const genreMap = {};
    savedBooks.forEach((book) => {
      const g = book.category || 'Other';
      genreMap[g] = (genreMap[g] || 0) + 1;
    });
    const genreData = Object.keys(genreMap).map((name) => ({
      name,
      value: genreMap[name],
    }));

    const totalPages = readBooks.reduce(
      (acc, book) => acc + (book.pageCount || 250),
      0
    );

    return {
      annualGoal,
      readCount: readBooks.length,
      progress,
      genreData,
      totalPages,
      currentCount: currentlyReading.length,
      streak: dbStats.readingStreak || 0,
    };
  }, [savedBooks, dbStats]);

  const COLORS = ['#4A3728', '#C1A88D', '#E5DCC3', '#D4C3A3', '#8B735B'];

  // --- API FUNCTIONS ---
  const fetchStatsFromDB = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stats/${user.email}`
      );
      const data = await res.json();
      if (data) setDbStats(data);
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  // ১. গোল আপডেট করার নতুন ফাংশন (ডিজাইন চেঞ্জ না করে যোগ করা হয়েছে)
  const handleGoalUpdate = async () => {
    const newGoal = prompt(
      'Set your new annual reading goal:',
      stats.annualGoal
    );
    if (newGoal && !isNaN(newGoal)) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/stats/update-goal`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              newGoal: parseInt(newGoal),
            }),
          }
        );
        if (response.ok) {
          fetchStatsFromDB();
          toast.success(`Goal updated to ${newGoal} books!`, {
            style: {
              borderRadius: '15px',
              background: '#4A3728',
              color: '#fff',
            },
          });
        }
      } catch (error) {
        toast.error('Failed to update goal');
      }
    }
  };

  const fetchMyLibrary = () => {
    setLoading(true);
    try {
      const keys = Object.keys(localStorage);
      const books = keys
        .filter((key) => key.startsWith('book_shelf_'))
        .map((key) => JSON.parse(localStorage.getItem(key)));
      setSavedBooks(books);
    } catch (error) {
      console.error('Error loading library:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
    if (user) {
      fetchMyLibrary();
      //   fetchStatsFromDB();
    }
  }, [user, authLoading, router]);

  const updateStatus = (id, newStatus) => {
    const updatedBooks = savedBooks.map((book) => {
      if (book._id === id) {
        const updatedBook = { ...book, status: newStatus };
        localStorage.setItem(`book_shelf_${id}`, JSON.stringify(updatedBook));
        return updatedBook;
      }
      return book;
    });
    setSavedBooks(updatedBooks);
    toast.success(`Moved to ${newStatus}`, {
      style: {
        borderRadius: '15px',
        background: '#4A3728',
        color: '#fff',
        fontSize: '12px',
      },
    });
  };

  const removeBook = (id) => {
    setSavedBooks(savedBooks.filter((book) => book._id !== id));
    localStorage.removeItem(`book_shelf_${id}`);
    toast.error('Removed from shelf', {
      icon: '🗑️',
      style: { borderRadius: '15px', background: '#4A3728', color: '#fff' },
    });
  };

  const handleRead = (book) => {
    setSelectedBook(book);
    setIsReading(true);
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center font-serif italic text-2xl bg-[#FDFBF7]">
        <div className="animate-pulse text-[#4A3728]">
          Curating your personal shelf...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3728] p-8 md:p-12">
      <Toaster position="bottom-right" />

      {isReading && selectedBook && (
        <ReaderView
          book={selectedBook}
          onBack={() => {
            setIsReading(false);
            fetchMyLibrary(); // fetch again to reflect updated status
          }}
          onShelfChange={updateStatus} // <-- এইটা ReaderView থেকে status আপডেটের জন্য
        />
      )}

      {!isReading && (
        <>
          <header className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h1 className="text-5xl font-serif font-bold mb-2">
                My Personal <span className="italic text-[#C1A88D]">Shelf</span>
              </h1>
              <p className="text-gray-400 font-medium uppercase text-[10px] tracking-[4px]">
                Welcome back, {user.displayName || user.email?.split('@')[0]}
              </p>
            </div>
            {user.photoURL && (
              <img
                src={user.photoURL}
                className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
                alt="profile"
              />
            )}
            <div className="w-1/2 md:w-auto">
              {' '}
              <button
                onClick={() => {
                  router.push('/my-library/analytics');
                  setShowAnalytics(true);
                }}
                className={`w-full p-5 rounded-3xl border flex items-center justify-between group transition-all hover:shadow-lg active:scale-95 ${
                  isDarkMode
                    ? 'bg-[#252525] border-gray-800 hover:bg-[#2d2d2d]'
                    : 'bg-white border-[#E5DCC3] hover:bg-[#FDFBF7]'
                }`}
              >
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#C1A88D]">
                    Stats & Progress
                  </p>
                  <p className="text-sm font-bold">View Detailed Insights</p>
                </div>
                <span className="text-xl group-hover:translate-x-1 transition-transform">
                  📈
                </span>
              </button>
            </div>
          </header>

          <section className="max-w-7xl mx-auto mb-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* গোল কার্ড - এখানে onClick যুক্ত করা হয়েছে */}
            <div
              onClick={handleGoalUpdate}
              className="bg-white rounded-[40px] p-8 border border-[#E5DCC3] flex flex-col items-center justify-center shadow-sm cursor-pointer hover:border-[#C1A88D] transition-all group"
            >
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 group-hover:text-[#C1A88D]">
                2026 Reading Goal{' '}
                <span className="opacity-0 group-hover:opacity-100 ml-2">
                  ✎
                </span>
              </h3>
              <div className="relative w-44 h-44">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="text-[#F8F5F0]"
                    strokeWidth="2"
                    stroke="currentColor"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="text-[#C1A88D] transition-all duration-1000"
                    strokeWidth="2"
                    strokeDasharray={`${stats.progress}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-serif font-bold">
                    {stats.readCount}
                  </span>
                  <span className="text-[10px] uppercase font-black text-gray-400">
                    of {stats.annualGoal} books
                  </span>
                </div>
              </div>
              <p className="mt-6 italic text-xs text-gray-400">
                You have reached {stats.progress}% of your goal
              </p>
            </div>

            <div className="lg:col-span-2 bg-white rounded-[40px] p-10 border border-[#E5DCC3] grid grid-cols-1 md:grid-cols-2 gap-10 shadow-sm">
              <div className="h-full min-h-[180px]">
                <h4 className="text-[10px] font-black uppercase tracking-[3px] mb-6 text-[#C1A88D]">
                  Reading Interests
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={
                        stats.genreData.length
                          ? stats.genreData
                          : [{ name: 'Empty', value: 1 }]
                      }
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {stats.genreData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                          stroke="none"
                        />
                      ))}
                      {!stats.genreData.length && <Cell fill="#F8F5F0" />}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '15px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center space-y-6">
                {[
                  {
                    label: 'Total Pages',
                    value: stats.totalPages.toLocaleString(),
                    unit: 'pg',
                  },
                  {
                    label: 'Currently Reading',
                    value: stats.currentCount,
                    unit: 'books',
                  },
                  {
                    label: 'Reading Streak',
                    value: stats.streak,
                    unit: 'days',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-end border-b border-[#F8F5F0] pb-3"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {item.label}
                    </span>
                    <span className="font-serif italic text-2xl">
                      {item.value}{' '}
                      <span className="text-[10px] not-italic font-bold text-[#C1A88D]">
                        {item.unit}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="max-w-7xl mx-auto space-y-16">
            {statusOptions.map((shelfStatus) => {
              const booksInShelf = savedBooks.filter(
                (b) => b.status === shelfStatus
              );
              return (
                <div key={shelfStatus} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-serif font-bold opacity-80">
                      {shelfStatus}
                    </h2>
                    <div className="h-[1px] flex-1 bg-[#E5DCC3]"></div>
                    <span className="text-xs font-black bg-[#4A3728] text-white px-3 py-1 rounded-full">
                      {booksInShelf.length}
                    </span>
                  </div>
                  {booksInShelf.length === 0 ? (
                    <div className="py-10 text-center border-2 border-dashed border-[#E5DCC3] rounded-[40px] italic text-gray-300">
                      No books in this section yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {booksInShelf.map((book) => (
                        <div
                          key={book._id}
                          className="bg-white rounded-[40px] p-6 border border-[#E5DCC3] flex gap-6 hover:shadow-xl transition-all group relative"
                        >
                          <div className="w-28 h-40 flex-shrink-0 rounded-2xl overflow-hidden shadow-md bg-gray-100">
                            <img
                              src={book.coverImage}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              alt={book.title}
                            />
                          </div>
                          <div className="flex flex-col justify-between py-1 w-full overflow-hidden">
                            <div>
                              <h3 className="text-lg font-bold leading-tight truncate">
                                {book.title}
                              </h3>
                              <p className="text-gray-400 text-xs italic mb-4">
                                by {book.author}
                              </p>
                              <select
                                value={book.status}
                                onChange={(e) =>
                                  updateStatus(book._id, e.target.value)
                                }
                                className="w-full bg-[#F8F5F0] border-none text-[#4A3728] text-[10px] font-bold py-2 px-3 rounded-xl outline-none cursor-pointer hover:bg-[#F1EFE9] transition-all mb-4"
                              >
                                {statusOptions.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => removeBook(book._id)}
                                className="text-[9px] font-black uppercase tracking-widest text-red-300 hover:text-red-500 transition-colors"
                              >
                                ✕ Remove
                              </button>
                              {book.status !== 'Read' && (
                                <button
                                  onClick={() => handleRead(book)}
                                  className="text-[9px] font-black uppercase tracking-widest text-[#C1A88D] hover:text-[#4A3728] transition-colors"
                                >
                                  📖 Read Now
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
