/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function TutorialsPage() {
  const { user } = useAuth();
  const [newVideo, setNewVideo] = useState({ title: '', url: '' });

  // ডামি ডাটা (আপনি এটা ডাটাবেস থেকে নিয়ে আসবেন)
  const [videos, setVideos] = useState([
    {
      id: 1,
      title: 'How to Build a Consistent Reading Habit',
      url: 'https://www.youtube.com/embed/I0T9vT6J3S8',
      tag: 'Tips',
    },
    {
      id: 2,
      title: 'Top 10 Classic Books Everyone Should Read',
      url: 'https://www.youtube.com/embed/S_OXatVvG_8',
      tag: 'Reviews',
    },
    {
      id: 3,
      title: 'Speed Reading: Read 100 Books a Year',
      url: 'https://www.youtube.com/embed/6i_W880P-m0',
      tag: 'Learning',
    },
    {
      id: 4,
      title: 'The Art of Taking Notes from Books',
      url: 'https://www.youtube.com/embed/uS_v_rZByG0',
      tag: 'Tips',
    },
  ]);

  // YouTube URL-কে Embed URL-এ রূপান্তর করার ফাংশন
  const getEmbedUrl = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const handleAddVideo = (e) => {
    e.preventDefault();
    const embedUrl = getEmbedUrl(newVideo.url);
    if (!embedUrl) return toast.error('Invalid YouTube URL');

    setVideos([
      {
        id: Date.now(),
        title: newVideo.title,
        url: embedUrl,
        tag: 'Admin Pick',
      },
      ...videos,
    ]);
    setNewVideo({ title: '', url: '' });
    toast.success('Tutorial Video Added! ✨');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3728] p-6 md:p-12">
      <Toaster />

      <header className="max-w-7xl mx-auto mb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 leading-tight">
          Reading <span className="italic text-[#C1A88D]">Tutorials</span>
        </h1>
        <p className="text-gray-400 font-medium tracking-widest uppercase text-[10px]">
          Master the art of reading with our curated masterclasses
        </p>
      </header>

      {/* ADMIN PANEL (Only visible to Admin) */}
      {user?.role === 'admin' && (
        <div className="max-w-4xl mx-auto mb-20 bg-white p-10 rounded-[40px] border border-[#E5DCC3] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            <h3 className="text-[10px] font-black uppercase tracking-[4px]">
              Admin: Add New Tutorial
            </h3>
          </div>
          <form
            onSubmit={handleAddVideo}
            className="flex flex-col md:flex-row gap-4"
          >
            <input
              type="text"
              placeholder="Tutorial Title (e.g. How to read faster)"
              value={newVideo.title}
              onChange={(e) =>
                setNewVideo({ ...newVideo, title: e.target.value })
              }
              required
              className="flex-1 px-6 py-4 rounded-2xl border border-[#E5DCC3] outline-none text-sm focus:border-[#C1A88D] transition-all"
            />
            <input
              type="text"
              placeholder="YouTube URL"
              value={newVideo.url}
              onChange={(e) =>
                setNewVideo({ ...newVideo, url: e.target.value })
              }
              required
              className="flex-1 px-6 py-4 rounded-2xl border border-[#E5DCC3] outline-none text-sm focus:border-[#C1A88D] transition-all"
            />
            <button
              type="submit"
              className="bg-[#4A3728] text-white px-10 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#C1A88D] transition-all shadow-lg"
            >
              Add Video
            </button>
          </form>
        </div>
      )}

      {/* VIDEO GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {videos.map((vid) => (
          <div key={vid.id} className="group flex flex-col">
            {/* Video Player */}
            <div className="relative aspect-video w-full rounded-[40px] overflow-hidden bg-black border border-[#E5DCC3] transition-all group-hover:shadow-2xl group-hover:-translate-y-2">
              <iframe
                className="w-full h-full"
                src={vid.url}
                title={vid.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Video Info */}
            <div className="mt-6">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#C1A88D] mb-2 block">
                {vid.tag}
              </span>
              <h3 className="text-xl font-serif font-bold group-hover:text-[#C1A88D] transition-colors">
                {vid.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* No Videos Fallback */}
      {videos.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 italic">
            No tutorials available at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
