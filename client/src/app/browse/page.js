/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
'use client';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import ReaderView from '@/components/ReaderView';

export default function BrowsePage() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isReading, setIsReading] = useState(false);

  const [userLibrary, setUserLibrary] = useState({});
  const [recommendations, setRecommendations] = useState({
    books: [],
    reason: '',
    type: '',
  });

  const fallbackImage =
    'https://images.unsplash.com/photo-1543003923-38833989e248?q=80&w=1000&auto=format&fit=crop';

  // ১. সকল বই এবং ইউজারের লাইব্রেরি ডাটা ফেচ করা
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resAll = await axios.get('http://localhost:5000/api/books/all');
        const allBooks = resAll.data?.books || resAll.data || [];
        setBooks(allBooks);

        // লোকাল স্টোরেজ থেকে ইউজারের বর্তমান লাইব্রেরি স্টেট লোড করা (ডিজাইন ঠিক রাখার জন্য)
        const savedLibrary = {};
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('book_shelf_')) {
            const bookData = JSON.parse(localStorage.getItem(key));
            savedLibrary[bookData._id] = { shelf: bookData.status };
          }
        });
        setUserLibrary(savedLibrary);

        if (user?._id) {
          const resRec = await axios.get(
            `http://localhost:5000/api/books/personalized/${user._id}`
          );
          setRecommendations({
            books: resRec.data.books,
            reason: resRec.data.reason,
            type: resRec.data.type,
            badge: resRec.data.type === 'Popular' ? 'Top Rated' : 'For You',
          });
        } else {
          const popular = allBooks.slice(0, 15);
          setRecommendations({
            books: popular,
            reason: 'Explore our collection of 70+ masterpieces!',
            type: 'Popular',
            badge: 'Community Choice',
          });
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to sync recommendations');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // ৩. এড টু শেলফ লজিক - এখানে LocalStorage কানেকশন যোগ করা হয়েছে
  const handleAddToShelf = (bookId, shelfName) => {
    if (!user) return toast.error('Please login first');

    // বইটির অবজেক্ট খুঁজে বের করা
    const bookToSave = books.find((b) => b._id === bookId);
    if (!bookToSave) return;

    // MyLibraryPage এর জন্য LocalStorage এ ডাটা সেভ করা
    const libraryEntry = {
      _id: bookToSave._id,
      title: bookToSave.title,
      author: bookToSave.author,
      genre: bookToSave.genre,
      coverImage: bookToSave.coverImage,
      status: shelfName, // 'Want to Read', 'Currently Reading', 'Read'
    };

    localStorage.setItem(`book_shelf_${bookId}`, JSON.stringify(libraryEntry));

    // স্টেট আপডেট (আপনার ডিজাইন রিফ্লেকশন এর জন্য)
    setUserLibrary((prev) => ({
      ...prev,
      [bookId]: { ...prev[bookId], shelf: shelfName, updatedAt: Date.now() },
    }));

    toast.success(`Moved to ${shelfName} ✨`);
  };

  const handleStartReading = (book) => {
    handleAddToShelf(book._id, 'Currently Reading');
    setSelectedBook(book);
    setIsReading(true);
  };

  const filteredBooks = useMemo(() => {
    if (!Array.isArray(books)) return [];
    let result = books.filter((book) => {
      const term = searchQuery.toLowerCase();
      const matchesSearch =
        book.title?.toLowerCase().includes(term) ||
        book.author?.toLowerCase().includes(term);
      const matchesGenre =
        selectedGenre === 'All' || book.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
    if (sortBy === 'az')
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    if (sortBy === 'za')
      result.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    if (sortBy === 'rating')
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return result;
  }, [books, searchQuery, selectedGenre, sortBy]);

  const genres = ['All', ...new Set(books.map((b) => b.genre).filter(Boolean))];

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-12 h-12 border-4 border-[#C1A88D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3728] relative">
      {isReading && selectedBook ? (
        <ReaderView
          book={selectedBook}
          onBack={() => setIsReading(false)}
          onShelfChange={handleAddToShelf}
        />
      ) : (
        <div className="p-6 md:p-12">
          <Toaster position="top-right" />

          {/* Hero Header - NO CHANGE */}
          <header className="max-w-7xl mx-auto mb-16 text-center">
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4 leading-tight">
              The <span className="italic text-[#C1A88D]">Lumina</span> Gallery
            </h1>
            <p className="text-gray-400 font-medium tracking-widest uppercase text-[10px]">
              Your gateway to timeless literature
            </p>
          </header>

          {/* Recommendation Section - NO CHANGE */}
          {recommendations.books.length > 0 && (
            <section className="max-w-7xl mx-auto mb-20">
              <div className="flex items-center justify-between mb-8 border-b border-[#E5DCC3] pb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl md:text-3xl font-serif font-bold italic text-[#C1A88D]">
                    Recommended for You
                  </h2>
                </div>
              </div>

              <div className="flex overflow-x-auto gap-8 pb-8 no-scrollbar scroll-smooth">
                {recommendations.books.map((book) => (
                  <div
                    key={book._id}
                    className="flex-shrink-0 w-[200px] group cursor-pointer"
                    onClick={() => setSelectedBook(book)}
                  >
                    <div className="h-[280px] w-full rounded-3xl overflow-hidden border border-[#E5DCC3] mb-4">
                      <img
                        src={book.coverImage || fallbackImage}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h4 className="text-sm font-bold font-serif line-clamp-1 group-hover:text-[#C1A88D] transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-[10px] text-gray-400 italic">
                      by {book.author}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Search & Filters - NO CHANGE */}
          <div className="max-w-6xl mx-auto mb-16 space-y-8">
            <input
              type="text"
              placeholder="Search by title, author, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-10 py-6 bg-white border border-[#E5DCC3] rounded-[30px] shadow-sm outline-none text-lg font-medium focus:shadow-xl transition-all"
            />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-5 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all ${selectedGenre === genre ? 'bg-[#4A3728] text-white' : 'bg-white text-gray-400 border border-[#E5DCC3]'}`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Grid - NO CHANGE IN DESIGN */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            {filteredBooks.map((book, index) => (
              <div key={book._id || index} className="group flex flex-col">
                <div className="relative h-[450px] w-full rounded-[40px] overflow-hidden bg-gray-100 border border-[#E5DCC3] transition-all group-hover:-translate-y-4 hover:shadow-2xl">
                  <img
                    src={book.coverImage || fallbackImage}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-8">
                    <button
                      onClick={() => setSelectedBook(book)}
                      className="bg-white text-[#4A3728] w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#C1A88D] transition-all"
                    >
                      Quick View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToShelf(book._id, 'Want to Read');
                      }}
                      className="bg-[#4A3728] text-white w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/20 hover:bg-black transition-all"
                    >
                      Want to Read +
                    </button>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-bold font-serif line-clamp-1 group-hover:text-[#C1A88D] transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-gray-400 text-sm italic">
                    by {book.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal - NO CHANGE IN DESIGN */}
      {selectedBook && !isReading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[50px] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="hidden md:block w-2/5">
              <img
                src={selectedBook.coverImage || fallbackImage}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-4xl font-serif font-bold leading-tight">
                    {selectedBook.title}
                  </h2>
                  <p className="text-[#C1A88D] font-serif italic text-xl">
                    by {selectedBook.author}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBook(null)}
                  className="text-2xl opacity-40 hover:opacity-100 transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {['Want to Read', 'Currently Reading', 'Read'].map((shelf) => (
                  <button
                    key={shelf}
                    onClick={() => handleAddToShelf(selectedBook._id, shelf)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${userLibrary[selectedBook._id]?.shelf === shelf ? 'bg-[#4A3728] text-white' : 'bg-[#FDFBF7] border border-[#E5DCC3] text-gray-400'}`}
                  >
                    {shelf}
                  </button>
                ))}
              </div>

              <div className="mb-10">
                <button
                  onClick={() => handleStartReading(selectedBook)}
                  className="bg-[#4A3728] text-white px-10 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-[2px] hover:bg-[#C1A88D] transition-all flex items-center gap-3"
                >
                  <span className="text-lg">📖</span> Read Full Masterpiece
                </button>
              </div>

              <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                {selectedBook.description || 'A timeless classic.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
