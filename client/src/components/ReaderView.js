/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ReaderView({ book, onBack, onShelfChange }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [fontSize, setFontSize] = useState(18);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [secondsRead, setSecondsRead] = useState(0);
  const [isFinished, setIsFinished] = useState(false); // [ADD] বই শেষ ট্র্যাকিং

  // --- রিভিউ এবং রেটিং স্টেট ---
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [approvedReviews, setApprovedReviews] = useState([]);

  const [unlockedPages, setUnlockedPages] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`unlocked_pages_${book._id}`);
      return saved ? parseInt(saved) : 1;
    }
    return 1;
  });

  const totalPages = 10; // [UPDATE] ১০০ থেকে ১০ করা হলো
  const progressPercent = Math.round((currentPage / totalPages) * 100);

  // --- এপ্রুভড রিভিউ ডাটাবেস থেকে স্থায়ীভাবে লোড করা ---
  useEffect(() => {
    const fetchReviews = async () => {
      if (!book?._id) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/books/${book._id}/reviews`
        );
        const allReviews = Array.isArray(res.data)
          ? res.data
          : res.data.reviews || [];

        // শুধু 'approved' রিভিউগুলো ফিল্টার
        const approved = allReviews.filter((rev) => rev.status === 'approved');
        setApprovedReviews(approved);
      } catch (err) {
        console.error('Failed to load permanent reviews:', err);
      }
    };
    fetchReviews();
  }, [book._id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRead((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return toast.error('Please write something');
    setSubmittingReview(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      await axios.post(`http://localhost:5000/api/books/${book._id}/review`, {
        userId: userData._id,
        userName: userData.name || 'Reader',
        rating: reviewRating,
        comment: reviewComment,
        bookTitle: book.title,
        status: 'pending', // অ্যাডমিন প্যানেলে জমা হবে
      });
      toast.success('Review sent for approval! ✨');
      setReviewComment('');
    } catch (err) {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
  };

  const handleNextPage = () => {
    if (currentPage >= totalPages) {
      setIsFinished(true); // [ADD] ১০ নম্বর পেজে ক্লিক করলে ফিনিশ হবে
      if (onShelfChange) onShelfChange(book._id, 'Read');
      return;
    }

    const nextPg = currentPage + 1;
    setCurrentPage(nextPg);

    if (nextPg > unlockedPages) {
      setUnlockedPages(nextPg);
      localStorage.setItem(`unlocked_pages_${book._id}`, nextPg.toString());
    }
  };

  useEffect(() => {
    const mainArea = document.getElementById('reader-content');
    if (mainArea) mainArea.scrollTo(0, 0);
  }, [currentPage, isFinished]);

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
                  disabled={isLocked || isFinished}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium transition-all flex justify-between items-center group ${isActive && !isFinished ? 'bg-[#C1A88D] text-white shadow-lg translate-x-1' : `hover:translate-x-1 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-white'}`} ${isLocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  <span className="flex items-center gap-3">
                    {isCompleted || (isFinished && pageNum <= totalPages) ? (
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
                    <span className="text-base filter drop-shadow-sm text-orange-600 font-bold">
                      🔒
                    </span>
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
            {isFinished ? (
              /* --- [ADD] সুন্দর এন্ড পেজ যা আপনার ডিজাইন মেনে চলে --- */
              <div className="flex flex-col items-center justify-center text-center py-20 animate-in fade-in zoom-in duration-1000">
                <div className="w-24 h-24 bg-[#C1A88D]/20 rounded-full flex items-center justify-center mb-8 text-6xl">
                  🏆
                </div>
                <h1 className="text-5xl font-serif font-bold mb-6 italic">
                  The End
                </h1>
                <p className="font-serif text-xl mb-10 opacity-90">
                  Congratulations! You have completed <br />{' '}
                  <span className="font-bold text-[#C1A88D]">
                    "{book.title}"
                  </span>
                </p>
                <p className="text-sm uppercase tracking-[4px] opacity-50 mb-12">
                  Total Time: {formatTime(secondsRead)}
                </p>
                <button
                  onClick={onBack}
                  className="bg-[#4A3728] text-white px-12 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#C1A88D] transition-all shadow-xl active:scale-95"
                >
                  Close Reader
                </button>
              </div>
            ) : (
              <>
                <span className="text-[10px] text-[#C1A88D] font-bold tracking-[4px] uppercase mb-10 block">
                  Page {currentPage} of {totalPages}
                </span>
                <h1 className="text-4xl font-serif font-bold mb-12 border-b pb-6 italic">
                  Chapter {Math.ceil(currentPage / 5)}
                </h1>
                <p className="font-serif mb-12">
                  This is the content for page {currentPage}.<br />
                  <br />
                  The stars didn't look like diamonds; they looked like the
                  cold, hard eyes of a god...
                </p>
                <div className="mt-20 flex justify-center border-t pt-10">
                  <button
                    onClick={handleNextPage}
                    className={`bg-[#C1A88D] text-white px-12 py-4 rounded-full font-bold text-sm tracking-widest hover:shadow-xl transition-all active:scale-95`}
                  >
                    {currentPage === totalPages
                      ? 'Finish Reading'
                      : 'Unlock Next Page →'}
                  </button>
                </div>
              </>
            )}
          </div>
        </main>

        <aside
          className={`w-80 border-l hidden xl:flex flex-col items-center p-10 overflow-y-auto no-scrollbar ${isDarkMode ? 'border-gray-800 bg-[#1e1e1e]' : 'border-[#E5DCC3] bg-[#F9F6F0]'}`}
        >
          <p className="text-[9px] font-black uppercase tracking-[3px] opacity-40 mb-12">
            Live Analytics
          </p>

          <div className="relative w-48 h-48 flex items-center justify-center p-2">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={isDarkMode ? '#333' : '#E5DCC3'}
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#C1A88D"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="282.7"
                strokeDashoffset={
                  282.7 - (282.7 * (isFinished ? 100 : progressPercent)) / 100
                }
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-bold">
                {isFinished ? '100' : progressPercent}%
              </span>
              <span className="text-[8px] uppercase tracking-widest opacity-50">
                Unlocked
              </span>
            </div>
          </div>

          <div className="w-full mt-12 space-y-4">
            {/* Approved Reviews List */}
            {approvedReviews.length > 0 && (
              <div className="space-y-3 mb-6 animate-in fade-in duration-700">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">
                  Reader Reviews
                </p>
                {approvedReviews.map((rev) => (
                  <div
                    key={rev._id}
                    className={`p-4 rounded-2xl border transition-all hover:shadow-md ${isDarkMode ? 'bg-[#252525] border-gray-800' : 'bg-white border-[#E5DCC3]'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-[#C1A88D]">
                        {rev.userName?.split(' ')[0]}
                      </span>
                      <span className="text-yellow-500 text-[10px]">
                        {'★'.repeat(rev.rating)}
                      </span>
                    </div>
                    <p className="text-[11px] italic opacity-70 line-clamp-2 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
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
              className={`p-6 rounded-[35px] border ${isDarkMode ? 'bg-[#252525] border-gray-800' : 'bg-white border-[#E5DCC3]'}`}
            >
              <p className="text-[9px] font-black uppercase tracking-widest mb-4 opacity-70">
                Share Your Experience
              </p>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`text-2xl transition-all ${star <= reviewRating ? 'text-yellow-500 scale-110' : 'text-gray-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="What did you think?"
                  className={`w-full p-4 rounded-2xl text-xs outline-none h-24 resize-none transition-all ${isDarkMode ? 'bg-[#1a1a1a] border-gray-700' : 'bg-[#FDFBF7] border-[#E5DCC3] border shadow-inner'}`}
                  required
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-[#4A3728] text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-[#C1A88D] transition-all shadow-md active:scale-95"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
