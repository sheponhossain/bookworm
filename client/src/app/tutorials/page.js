/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

export default function TutorialsPage() {
  const { user } = useAuth();
  const [newVideo, setNewVideo] = useState({ title: '', url: '' });
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // অ্যাডমিন চেক (ইমেইল দিয়ে করা নিরাপদ)
  const isAdmin = user?.email === 'admin@gmail.com' || user?.role === 'admin';

  // --- ডাটাবেস থেকে ভিডিও লোড করা ---
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tutorials');
        // আপনার এপিআই যদি সরাসরি অ্যারে পাঠায় তবে res.data, আর যদি অবজেক্টে পাঠায় তবে res.data.tutorials
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.tutorials || [];
        setVideos(data);
      } catch (err) {
        console.error('Video loading error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // YouTube URL-কে Embed URL-এ রূপান্তর
  // URL কনভার্টার ফাংশন (এটি ফ্রন্টএন্ড ফাইলের ভেতরে রাখুন)
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : url; // অলরেডি এমবেড লিঙ্ক থাকলে সেটাই রিটার্ন করবে
  };

  // --- ভিডিও যোগ করা (Admin Only) ---
  const handleAddVideo = async (e) => {
    e.preventDefault();
    const embedUrl = getEmbedUrl(newVideo.url);
    if (!embedUrl) return toast.error('Invalid YouTube URL');

    try {
      const videoData = {
        title: newVideo.title,
        url: embedUrl,
        tag: 'Admin Pick',
      };

      // ব্যাকএন্ডে সেভ করা
      const res = await axios.post(
        'http://localhost:5000/api/tutorials/add',
        videoData
      );

      if (res.status === 201 || res.status === 200) {
        setVideos([res.data, ...videos]);
        setNewVideo({ title: '', url: '' });
        toast.success('Tutorial Added to Database! ✨');
      }
    } catch (err) {
      toast.error('Failed to save video to database');
    }
  };

  // --- ভিডিও ডিলিট করা (Admin Only) ---
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tutorial?'))
      return;

    try {
      await axios.delete(`http://localhost:5000/api/tutorials/${id}`);
      setVideos(videos.filter((vid) => vid._id !== id));
      toast.error('Tutorial Removed');
    } catch (err) {
      toast.error('Failed to delete video');
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#FDFBF7] font-serif">
        Loading Tutorials...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3728] p-6 md:p-12">
      <Toaster position="bottom-right" />

      <header className="max-w-7xl mx-auto mb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 leading-tight">
          Reading <span className="italic text-[#C1A88D]">Tutorials</span>
        </h1>
        <p className="text-gray-400 font-medium tracking-widest uppercase text-[10px]">
          Master the art of reading with our curated masterclasses
        </p>
      </header>

      {/* ADMIN PANEL */}
      {isAdmin && (
        <div className="max-w-4xl mx-auto mb-20 bg-white p-8 md:p-10 rounded-[40px] border border-[#E5DCC3] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            <h3 className="text-[10px] font-black uppercase tracking-[4px]">
              Admin Control: New Tutorial
            </h3>
          </div>
          <form
            onSubmit={handleAddVideo}
            className="flex flex-col md:flex-row gap-4"
          >
            <input
              type="text"
              placeholder="Title..."
              value={newVideo.title}
              onChange={(e) =>
                setNewVideo({ ...newVideo, title: e.target.value })
              }
              required
              className="flex-1 px-6 py-4 rounded-2xl border border-[#E5DCC3] outline-none text-sm focus:border-[#C1A88D]"
            />
            <input
              type="text"
              placeholder="YouTube Link..."
              value={newVideo.url}
              onChange={(e) =>
                setNewVideo({ ...newVideo, url: e.target.value })
              }
              required
              className="flex-1 px-6 py-4 rounded-2xl border border-[#E5DCC3] outline-none text-sm focus:border-[#C1A88D]"
            />
            <button
              type="submit"
              className="bg-[#4A3728] text-white px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#C1A88D] transition-all"
            >
              Post Video
            </button>
          </form>
        </div>
      )}

      {/* VIDEO GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {videos.map((vid) => (
          <div key={vid._id || vid.id} className="group relative">
            {/* Video Player */}
            <div className="relative aspect-video w-full rounded-[35px] overflow-hidden bg-black border border-[#E5DCC3] group-hover:shadow-2xl transition-all">
              {vid.url ? (
                <iframe
                  className="w-full h-full"
                  src={`${getEmbedUrl(vid.url)}?rel=0&modestbranding=1&origin=http://localhost:3000`}
                  title={vid.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 italic text-xs">
                  Invalid Video URL
                </div>
              )}
            </div>

            <div className="mt-6 px-2">
              <span className="text-[9px] font-black uppercase tracking-[4px] text-[#C1A88D] mb-2 block">
                {vid.tag || 'Tutorial'}
              </span>
              <h3 className="text-xl font-serif font-bold group-hover:text-[#C1A88D] transition-colors leading-tight">
                {vid.title}
              </h3>
            </div>

            {/* Admin Delete Button */}
            {isAdmin && (
              <button
                onClick={() => handleDelete(vid._id || vid.id)}
                className="absolute -top-2 -right-2 bg-white text-red-500 w-8 h-8 rounded-full shadow-lg flex items-center justify-center border border-red-50 hover:bg-red-500 hover:text-white transition-all"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-20 opacity-40 italic">
          No tutorials found.
        </div>
      )}
    </div>
  );
}
