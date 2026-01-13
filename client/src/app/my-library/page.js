/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import ReaderView from '@/components/ReaderView'; // ReaderView ইম্পোর্ট নিশ্চিত করুন

export default function MyLibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [savedBooks, setSavedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // রিডার ভিউ কন্ট্রোল করার জন্য স্টেট
  const [selectedBook, setSelectedBook] = useState(null);
  const [isReading, setIsReading] = useState(false);

  const statusOptions = ['Want to Read', 'Currently Reading', 'Read'];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

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
    if (user) {
      fetchMyLibrary();
    }
  }, [user]);

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

  // রিড বাটনের ফাংশন
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

      {/* রিডার ভিউ ওপেন হলে এটি দেখাবে */}
      {isReading && selectedBook && (
        <ReaderView
          book={selectedBook}
          onBack={() => {
            setIsReading(false);
            fetchMyLibrary(); // লাইব্রেরি রিফ্রেশ করা
          }}
          onShelfChange={updateStatus}
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
          </header>

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

                              {/* বই পড়া হয়ে গেলে (Read স্ট্যাটাস) Read বাটন দেখাবে না */}
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
