/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import ReaderView from '@/components/ReaderView';

export default function AllBooksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 8;

  const [selectedBook, setSelectedBook] = useState(null);
  const [isReading, setIsReading] = useState(false);

  const isAdmin = user?.email === 'admin@gmail.com';
  const fallbackImage =
    'https://images.unsplash.com/photo-1543003923-38833989e248?q=80&w=1000&auto=format&fit=crop';

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/books/all');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setBooks(data.books || data || []);
      } catch (err) {
        toast.error('Failed to load books.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleStartReading = (book) => {
    const bookData = {
      ...book,
      status: 'Currently Reading',
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(`book_shelf_${book._id}`, JSON.stringify(bookData));
    setSelectedBook(book);
    setIsReading(true);

    toast.success(`Reading: ${book.title}`, {
      icon: '📖',
      style: { borderRadius: '15px', background: '#4A3728', color: '#fff' },
    });
  };

  const addToWishlist = (book) => {
    const bookData = {
      ...book,
      status: 'Want to Read',
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(`book_shelf_${book._id}`, JSON.stringify(bookData));
    toast.success(`Added to Wishlist! ✨`);
  };

  const filteredBooks = useMemo(() => {
    return books.filter(
      (b) =>
        b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [books, searchQuery]);

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const currentBooks = filteredBooks.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#FDFBF7] font-serif tracking-widest uppercase text-[10px]">
        Loading Archive...
      </div>
    );

  if (isReading && selectedBook) {
    return (
      <ReaderView book={selectedBook} onBack={() => setIsReading(false)} />
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3728] p-6 md:p-12">
      <Toaster position="bottom-right" />

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16">
          <div className="flex items-center gap-5">
            <button
              onClick={() => router.back()}
              className="w-12 h-12 rounded-full border border-[#E5DCC3] flex items-center justify-center hover:bg-white transition-all shadow-sm"
            >
              ←
            </button>
            <h1 className="text-4xl font-serif font-bold">
              The Great <span className="italic text-[#C1A88D]">Archive</span>
            </h1>
          </div>

          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search archive..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-8 py-4 bg-white border border-[#E5DCC3] rounded-[20px] shadow-sm outline-none font-serif italic"
            />
          </div>
        </header>

        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {currentBooks.map((book) => (
            <div
              key={book._id}
              className="bg-white rounded-[35px] p-4 border border-[#E5DCC3] hover:shadow-2xl transition-all duration-500 group relative"
            >
              {isAdmin && (
                <button
                  onClick={() => router.push(`/admin/edit-book/${book._id}`)}
                  className="absolute top-6 right-6 z-10 bg-white/90 shadow-md w-10 h-10 rounded-full flex items-center justify-center border border-[#E5DCC3] hover:bg-[#4A3728] hover:text-white transition-all"
                >
                  ✎
                </button>
              )}

              <div className="aspect-[10/14] rounded-[25px] overflow-hidden mb-6 shadow-md relative">
                <img
                  src={book.coverImage || fallbackImage}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt=""
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                  <button
                    onClick={() => handleStartReading(book)}
                    className="w-full py-3 bg-white text-[#4A3728] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#C1A88D] hover:text-white transition-all"
                  >
                    📖 Start Reading
                  </button>
                </div>
              </div>

              <div className="px-2 pb-2 text-center">
                <h3 className="font-serif font-bold text-lg line-clamp-1 mb-1">
                  {book.title}
                </h3>
                <p className="text-[#C1A88D] text-xs italic mb-4">
                  by {book.author}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => addToWishlist(book)}
                    className="flex-1 py-2.5 rounded-xl border border-[#E5DCC3] text-[9px] font-black uppercase hover:bg-[#4A3728] hover:text-white transition-all"
                  >
                    + Wishlist
                  </button>
                  <button
                    onClick={() => router.push(`/book/${book._id}`)}
                    className="px-4 py-2.5 rounded-xl bg-[#F8F5F0] text-[9px] font-black uppercase hover:bg-[#E5DCC3]"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </main>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-20 flex items-center justify-center gap-8">
            <button
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((prev) => prev - 1);
                window.scrollTo(0, 0);
              }}
              className="w-12 h-12 rounded-full border border-[#E5DCC3] disabled:opacity-20 hover:bg-white transition-all"
            >
              ←
            </button>
            <div className="font-serif italic text-lg">
              {currentPage} <span className="text-[#C1A88D]">/</span>{' '}
              {totalPages}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage((prev) => prev + 1);
                window.scrollTo(0, 0);
              }}
              className="w-12 h-12 rounded-full border border-[#E5DCC3] disabled:opacity-20 hover:bg-white transition-all"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
