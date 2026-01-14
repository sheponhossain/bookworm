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

  // dbStats এর বদলে localStats ব্যবহার করছি
  const [localStats, setLocalStats] = useState({
    annualGoal: 50,
    readingStreak: 0,
  });

  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [tempGoal, setTempGoal] = useState(50);

  const statusOptions = ['Want to Read', 'Currently Reading', 'Read'];

  const stats = useMemo(() => {
    const readBooks = savedBooks.filter((b) => b.status === 'Read');
    const currentlyReading = savedBooks.filter(
      (b) => b.status === 'Currently Reading'
    );

    const annualGoal = localStats.annualGoal || 50;
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

    return {
      annualGoal,
      readCount: readBooks.length,
      progress,
      genreData,
      totalPages: readBooks.reduce(
        (acc, book) => acc + (book.pageCount || 250),
        0
      ),
      currentCount: currentlyReading.length,
      streak: localStats.readingStreak || 0,
    };
  }, [savedBooks, localStats]);

  const COLORS = ['#4A3728', '#C1A88D', '#E5DCC3', '#D4C3A3', '#8B735B'];

  // --- লোকালস্টোরেজ থেকে গোল এবং স্ট্যাটাস লোড করা ---
  const loadLocalStats = () => {
    const savedGoal = localStorage.getItem('user_reading_goal');
    if (savedGoal) {
      const goalValue = parseInt(savedGoal);
      setLocalStats((prev) => ({ ...prev, annualGoal: goalValue }));
      setTempGoal(goalValue);
    }
  };

  // --- গোল আপডেট করার ফাংশন (LocalStorage) ---
  const saveNewGoal = () => {
    localStorage.setItem('user_reading_goal', tempGoal.toString());
    setLocalStats((prev) => ({ ...prev, annualGoal: tempGoal }));
    setIsGoalModalOpen(false);
    toast.success(`Goal updated to ${tempGoal} books! 🎯`, {
      style: { borderRadius: '15px', background: '#4A3728', color: '#fff' },
    });
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
    if (!authLoading && !user) router.push('/auth/login');
    if (user) {
      fetchMyLibrary();
      loadLocalStats(); // ডেটাবেসের বদলে লোকাল থেকে লোড
    }
  }, [user, authLoading, router]);

  // স্ট্যাটাস আপডেট লজিক
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
      style: { borderRadius: '15px', background: '#4A3728', color: '#fff' },
    });
  };

  const removeBook = (id) => {
    setSavedBooks(savedBooks.filter((book) => book._id !== id));
    localStorage.removeItem(`book_shelf_${id}`);
    toast.error('Removed from shelf', {
      style: { borderRadius: '15px', background: '#4A3728', color: '#fff' },
    });
  };

  if (authLoading || loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#FDFBF7] font-serif text-[#4A3728]">
        Curating your shelf...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3728] p-8 md:p-12">
      <Toaster position="bottom-right" />

      {isReading && selectedBook ? (
        <ReaderView
          book={selectedBook}
          onBack={() => {
            setIsReading(false);
            fetchMyLibrary();
          }}
          onShelfChange={updateStatus}
        />
      ) : (
        <>
          {/* Header */}
          <header className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h1 className="text-5xl font-serif font-bold mb-2">
                My Personal <span className="italic text-[#C1A88D]">Shelf</span>
              </h1>
              <p className="text-gray-400 font-medium uppercase text-[10px] tracking-[4px]">
                Welcome, {user.displayName || user.email?.split('@')[0]}
              </p>
            </div>
            <button
              onClick={() => router.push('/my-library/analytics')}
              className="bg-white border border-[#E5DCC3] p-5 rounded-3xl flex items-center gap-4 hover:shadow-lg transition-all shadow-sm"
            >
              <div className="text-left">
                <p className="text-[9px] font-black uppercase text-[#C1A88D]">
                  Insights
                </p>
                <p className="text-sm font-bold">Analytics</p>
              </div>
              <span className="text-xl">📈</span>
            </button>
          </header>

          <section className="max-w-7xl mx-auto mb-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* গোল কার্ড */}
            <div
              onClick={() => setIsGoalModalOpen(true)}
              className="bg-white rounded-[40px] p-8 border border-[#E5DCC3] flex flex-col items-center justify-center shadow-sm cursor-pointer hover:border-[#C1A88D] transition-all group"
            >
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-6">
                2026 Reading Goal <span className="text-[#C1A88D] ml-1">✎</span>
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
                Reached {stats.progress}% of your goal
              </p>
            </div>

            {/* অন্যান্য স্ট্যাটাস */}
            <div className="lg:col-span-2 bg-white rounded-[40px] p-10 border border-[#E5DCC3] grid grid-cols-1 md:grid-cols-2 gap-10 shadow-sm">
              <div className="h-full min-h-[180px]">
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
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center space-y-6">
                <StatRow
                  label="Total Pages"
                  value={stats.totalPages.toLocaleString()}
                  unit="pg"
                />
                <StatRow
                  label="Currently Reading"
                  value={stats.currentCount}
                  unit="books"
                />
                <StatRow label="Streak" value={stats.streak} unit="days" />
              </div>
            </div>
          </section>

          {/* বুক শেলফ সেকশন */}
          <div className="max-w-7xl mx-auto space-y-16">
            {statusOptions.map((shelfStatus) => (
              <ShelfSection
                key={shelfStatus}
                status={shelfStatus}
                books={savedBooks.filter((b) => b.status === shelfStatus)}
                updateStatus={updateStatus}
                removeBook={removeBook}
                handleRead={setSelectedBook}
                setIsReading={setIsReading}
              />
            ))}
          </div>
        </>
      )}

      {/* --- পপআপ (MODAL) --- */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-[#FDFBF7] border border-[#E5DCC3] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
              🎯
            </div>
            <h3 className="text-2xl font-serif font-bold mb-2">Reading Goal</h3>
            <p className="text-[#C1A88D] text-sm mb-8 italic">
              Set your goal via LocalStorage
            </p>

            <div className="flex items-center justify-center gap-6 mb-10">
              <button
                onClick={() => setTempGoal(Math.max(1, tempGoal - 1))}
                className="w-12 h-12 rounded-full border border-[#E5DCC3] text-2xl hover:bg-[#4A3728] hover:text-white transition-all"
              >
                -
              </button>
              <span className="text-4xl font-black text-[#4A3728]">
                {tempGoal}
              </span>
              <button
                onClick={() => setTempGoal(tempGoal + 1)}
                className="w-12 h-12 rounded-full border border-[#E5DCC3] text-2xl hover:bg-[#4A3728] hover:text-white transition-all"
              >
                +
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="flex-1 py-4 rounded-2xl border border-[#E5DCC3] text-[10px] font-black uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={saveNewGoal}
                className="flex-1 py-4 rounded-2xl bg-[#4A3728] text-white text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// সাব-কম্পোনেন্টসমূহ (বাকি কোড আপনার আগের মতোই আছে)
function StatRow({ label, value, unit }) {
  return (
    <div className="flex justify-between items-end border-b border-[#F8F5F0] pb-3">
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <span className="font-serif italic text-2xl">
        {value}{' '}
        <span className="text-[10px] not-italic font-bold text-[#C1A88D]">
          {unit}
        </span>
      </span>
    </div>
  );
}

function ShelfSection({
  status,
  books,
  updateStatus,
  removeBook,
  handleRead,
  setIsReading,
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-serif font-bold opacity-80">{status}</h2>
        <div className="h-[1px] flex-1 bg-[#E5DCC3]"></div>
        <span className="text-xs font-black bg-[#4A3728] text-white px-3 py-1 rounded-full">
          {books.length}
        </span>
      </div>
      {books.length === 0 ? (
        <div className="py-10 text-center border-2 border-dashed border-[#E5DCC3] rounded-[40px] italic text-gray-300">
          No books here yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book) => (
            <div
              key={book._id}
              className="bg-white rounded-[40px] p-6 border border-[#E5DCC3] flex gap-6 hover:shadow-xl transition-all group"
            >
              <div className="w-24 h-36 flex-shrink-0 rounded-2xl overflow-hidden shadow-md">
                <img
                  src={book.coverImage}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
              <div className="flex flex-col justify-between w-full">
                <div>
                  <h3 className="text-base font-bold leading-tight truncate">
                    {book.title}
                  </h3>
                  <p className="text-gray-400 text-[10px] italic mb-3">
                    by {book.author}
                  </p>
                  <select
                    value={book.status}
                    onChange={(e) => updateStatus(book._id, e.target.value)}
                    className="w-full bg-[#F8F5F0] text-[10px] font-bold py-2 px-2 rounded-xl outline-none cursor-pointer"
                  >
                    {['Want to Read', 'Currently Reading', 'Read'].map(
                      (opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <button
                    onClick={() => removeBook(book._id)}
                    className="text-[9px] font-black uppercase text-red-300 hover:text-red-500"
                  >
                    ✕ Remove
                  </button>
                  {status !== 'Read' && (
                    <button
                      onClick={() => {
                        handleRead(book);
                        setIsReading(true);
                      }}
                      className="text-[9px] font-black uppercase text-[#C1A88D]"
                    >
                      📖 Read
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
}
