/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
'use client';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import ReaderView from '@/components/ReaderView';
import { useRouter } from 'next/navigation';

export default function BrowsePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [userLibrary, setUserLibrary] = useState({});
  const [sliderBooks, setSliderBooks] = useState([]);

  const fallbackImage =
    'https://images.unsplash.com/photo-1543003923-38833989e248?q=80&w=1000&auto=format&fit=crop';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resAll = await axios.get('http://localhost:5000/api/books/all');
        const allBooks = resAll.data.books || resAll.data || [];
        setBooks(allBooks);
        setSliderBooks([...allBooks.slice(0, 5), ...allBooks.slice(0, 5)]);

        const savedLibrary = {};
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('book_shelf_')) {
            try {
              const bookData = JSON.parse(localStorage.getItem(key));
              savedLibrary[bookData._id] = { shelf: bookData.status };
            } catch (e) {
              console.error('Storage error', e);
            }
          }
        });
        setUserLibrary(savedLibrary);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleAddToShelf = (bookId, shelfName) => {
    if (!user) return toast.error('Please login first');
    const bookToSave = books.find((b) => b._id === bookId);
    if (!bookToSave) return;

    localStorage.setItem(
      `book_shelf_${bookId}`,
      JSON.stringify({ ...bookToSave, status: shelfName })
    );
    setUserLibrary((prev) => ({ ...prev, [bookId]: { shelf: shelfName } }));
    // শুধুমাত্র ম্যানুয়াল সেলফ চেঞ্জের জন্য টোস্ট দেখাবে, অটো-রিডিং স্টার্টের জন্য নিচে আলাদা লজিক আছে
    if (shelfName !== 'Currently Reading') {
      toast.success(`Moved to ${shelfName} ✨`);
    }
  };

  // --- নতুন ফাংশন: Start Reading বাটনের জন্য ---
  const handleStartReading = (book) => {
    if (!user) return toast.error('Please login first to read');

    // বইটিকে 'Currently Reading' হিসেবে লাইব্রেরিতে সেভ করা
    handleAddToShelf(book._id, 'Currently Reading');

    // রিডার ভিউ ওপেন করা
    setIsReading(true);
    toast.success('Added to Currently Reading 📖');
  };

  const genres = ['All', ...new Set(books.map((b) => b.genre).filter(Boolean))];

  const filteredBooks = useMemo(() => {
    if (!Array.isArray(books)) return [];
    return books.filter((book) => {
      const matchesSearch =
        book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre =
        selectedGenre === 'All' || book.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  }, [books, searchQuery, selectedGenre]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-10 h-10 border-4 border-[#C1A88D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3728]">
      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-infinite-scroll {
          display: flex;
          width: max-content;
          animation: scroll 40s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {isReading && selectedBook ? (
        <ReaderView
          book={selectedBook}
          onBack={() => setIsReading(false)}
          onShelfChange={handleAddToShelf}
        />
      ) : (
        <div className="flex flex-col lg:flex-row max-w-[1600px] mx-auto min-h-screen">
          <div className="flex-1 lg:max-w-[calc(100%-320px)] border-r border-[#E5DCC3]/40 p-6 md:p-10">
            <Toaster position="top-right" />

            <section className="mb-12 overflow-hidden">
              <h2 className="text-[10px] font-black uppercase tracking-[4px] text-[#C1A88D] mb-6">
                Editor's Picks
              </h2>
              <div className="animate-infinite-scroll gap-5">
                {sliderBooks.map((book, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedBook(book)}
                    className="w-[120px] md:w-[140px] shrink-0 cursor-pointer group"
                  >
                    <div className="h-[180px] md:h-[200px] rounded-2xl overflow-hidden border border-[#E5DCC3] shadow-sm group-hover:shadow-md transition-all">
                      <img
                        src={book.coverImage || fallbackImage}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 order-2 md:order-1">
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                      selectedGenre === g
                        ? 'bg-[#4A3728] text-white border-[#4A3728]'
                        : 'bg-white text-[#C1A88D] border-[#E5DCC3]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <div className="relative w-full max-w-sm order-1 md:order-2">
                <input
                  type="text"
                  placeholder="Search classics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-3.5 bg-white border border-[#E5DCC3] rounded-2xl shadow-sm outline-none text-sm font-serif italic focus:ring-2 focus:ring-[#C1A88D]/20 transition-all"
                />
              </div>
            </div>
            {/* Explore All Books */}
            <section className="mb-12 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black uppercase tracking-[4px] text-[#C1A88D]">
                  Explore All Books
                </h2>
                {/* এই বাটনে এখন আর এরর আসবে না */}
                <button
                  onClick={() => router.push('/all-books')}
                  className="text-[10px] font-black uppercase tracking-widest bg-[#4A3728] text-white px-6 py-2.5 rounded-xl hover:bg-[#C1A88D] transition-all"
                >
                  View All Books →
                </button>
              </div>
            </section>

            <main className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10">
              {filteredBooks.map((book) => (
                <div
                  key={book._id}
                  className="group flex flex-col items-center"
                >
                  <div className="relative aspect-[10/14] w-full max-w-[260px] rounded-[35px] overflow-hidden bg-white border border-[#E5DCC3] transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                    <img
                      src={book.coverImage || fallbackImage}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#4A3728]/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 p-6">
                      <button
                        onClick={() => setSelectedBook(book)}
                        className="bg-white text-[#4A3728] w-full py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-[#C1A88D] hover:text-white transition-colors"
                      >
                        Quick View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToShelf(book._id, 'Want to Read');
                        }}
                        className="text-white border border-white/30 w-full py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white/10 transition-colors"
                      >
                        Want to Read +
                      </button>
                    </div>
                    {userLibrary[book._id] && (
                      <div className="absolute top-4 right-4 bg-[#C1A88D] text-white text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-tighter shadow-sm">
                        {userLibrary[book._id].shelf}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="text-sm font-bold font-serif line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-[#C1A88D] text-[11px] italic">
                      by {book.author}
                    </p>
                  </div>
                </div>
              ))}
            </main>
          </div>

          <aside className="w-full lg:w-[320px] bg-white p-8 lg:min-h-screen">
            <div className="lg:sticky lg:top-10 mt-10">
              <div className="mb-10 pb-4 border-b border-[#FDFBF7]">
                <h3 className="text-xl font-serif font-bold text-[#4A3728]">
                  Community
                </h3>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#C1A88D]">
                  Live Activity
                </p>
              </div>
              <div className="space-y-8">
                <ActivityItem
                  user="User X"
                  action="added"
                  target="Mastering React"
                />
                <ActivityItem
                  user="User Z"
                  action="rated"
                  target="Atomic Habits"
                />
                <ActivityItem
                  user="User A"
                  action="finished"
                  target="Clean Code"
                />
              </div>
              <div className="mt-16 p-6 bg-[#FDFBF7] rounded-[30px] border border-[#E5DCC3] text-center">
                <button className="w-full py-4 rounded-2xl bg-[#4A3728] text-white text-[9px] font-black uppercase tracking-[3px] hover:bg-[#C1A88D] transition-all">
                  Global Chat
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* --- QUICK VIEW MODAL --- */}
      {selectedBook && !isReading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[45px] max-w-3xl w-full overflow-hidden flex flex-col md:flex-row shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-6 right-8 text-2xl opacity-30 hover:opacity-100 transition-all"
            >
              ✕
            </button>
            <div className="w-full md:w-5/12 h-[350px] md:h-auto">
              <img
                src={selectedBook.coverImage || fallbackImage}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-10 flex-1 flex flex-col justify-center bg-[#FDFBF7]">
              <h2 className="text-3xl font-serif font-bold mb-2 leading-tight">
                {selectedBook.title}
              </h2>
              <p className="text-[#C1A88D] italic text-lg mb-8 font-serif">
                by {selectedBook.author}
              </p>
              <div className="flex gap-2 mb-8">
                {['Want to Read', 'Read'].map((shelf) => (
                  <button
                    key={shelf}
                    onClick={() => handleAddToShelf(selectedBook._id, shelf)}
                    className="px-5 py-2.5 rounded-xl border border-[#E5DCC3] text-[9px] font-black uppercase tracking-widest hover:bg-[#4A3728] hover:text-white transition-all"
                  >
                    {shelf}
                  </button>
                ))}
              </div>
              {/* --- আপডেট করা বাটন --- */}
              <button
                onClick={() => handleStartReading(selectedBook)}
                className="bg-[#4A3728] text-white w-fit px-12 py-4 rounded-xl font-black uppercase text-[10px] tracking-[4px] hover:bg-[#C1A88D] transition-all shadow-lg"
              >
                Start Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ user, action, target }) {
  const [isFollowing, setIsFollowing] = useState(false);
  return (
    <div className="flex gap-4 items-start group">
      <div className="w-10 h-10 rounded-2xl bg-[#FDFBF7] border border-[#E5DCC3] flex items-center justify-center text-[10px] font-black shrink-0 transition-all group-hover:bg-[#4A3728] group-hover:text-white uppercase">
        {user.charAt(5)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-black text-[10px] uppercase truncate">
            {user}
          </span>
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`text-[7px] font-black uppercase px-2.5 py-1 rounded-full border transition-all ${isFollowing ? 'bg-[#C1A88D] border-[#C1A88D] text-white' : 'border-[#E5DCC3] text-[#C1A88D] hover:bg-[#4A3728] hover:text-white'}`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
        <p className="text-[10px] leading-tight text-gray-500">
          {action} <span className="font-bold text-[#4A3728]">"{target}"</span>
        </p>
      </div>
    </div>
  );
}
