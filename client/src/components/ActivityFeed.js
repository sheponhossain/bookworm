'use client';
import { useState, useEffect } from 'react';

export default function ActivityFeed() {
  // ডামি ডাটা (পরবর্তীতে আপনার ডাটাবেস থেকে আসবে)
  const [activities, setActivities] = useState([
    {
      id: 1,
      user: 'User X',
      action: 'added',
      book: 'The Great Gatsby',
      shelf: 'Read',
      time: '2m ago',
      icon: '📚',
    },
    {
      id: 2,
      user: 'User Z',
      action: 'rated',
      book: 'Atomic Habits',
      rating: 5,
      time: '15m ago',
      icon: '⭐',
    },
    {
      id: 3,
      user: 'User A',
      action: 'finished',
      book: 'Clean Code',
      time: '1h ago',
      icon: '🏆',
    },
    {
      id: 4,
      user: 'Sarah',
      action: 'following',
      target: 'John Doe',
      time: '3h ago',
      icon: '👤',
    },
  ]);

  return (
    <aside className="w-full max-w-sm bg-white rounded-[35px] border border-[#E5DCC3] p-8 shadow-sm h-fit sticky top-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-serif font-bold text-[#4A3728]">
            Community Feed
          </h3>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
            Social activity
          </p>
        </div>
        <span className="text-xl">✨</span>
      </div>

      <div className="space-y-6">
        {activities.map((act) => (
          <div
            key={act.id}
            className="group flex gap-4 items-start relative pb-6 border-b border-[#F8F5F0] last:border-none last:pb-0"
          >
            {/* User Avatar Circle */}
            <div className="w-10 h-10 rounded-full bg-[#FDFBF7] border border-[#E5DCC3] flex items-center justify-center text-sm shadow-sm flex-shrink-0 group-hover:bg-[#C1A88D] group-hover:text-white transition-all">
              {act.user.charAt(0)}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-black text-[#4A3728] uppercase tracking-tighter">
                  {act.user}
                </span>
                <span className="text-[9px] text-gray-400 font-bold">
                  {act.time}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-gray-600">
                {act.action === 'added' && (
                  <>
                    Added{' '}
                    <span className="font-bold text-[#4A3728]">
                      "{act.book}"
                    </span>{' '}
                    to{' '}
                    <span className="italic text-[#C1A88D]">{act.shelf}</span>{' '}
                    shelf.
                  </>
                )}
                {act.action === 'rated' && (
                  <>
                    Rated{' '}
                    <span className="font-bold text-[#4A3728]">
                      "{act.book}"
                    </span>{' '}
                    <span className="text-yellow-500 font-bold">
                      {act.rating} stars
                    </span>
                    .
                  </>
                )}
                {act.action === 'finished' && (
                  <>
                    Finished reading{' '}
                    <span className="font-bold text-[#4A3728]">
                      "{act.book}"
                    </span>
                    . {act.icon}
                  </>
                )}
                {act.action === 'following' && (
                  <>
                    Started following{' '}
                    <span className="font-black text-[#C1A88D]">
                      {act.target}
                    </span>
                    .
                  </>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-8 py-4 rounded-2xl border border-[#E5DCC3] text-[9px] font-black uppercase tracking-[3px] hover:bg-[#FDFBF7] transition-all active:scale-95">
        Explore Community
      </button>
    </aside>
  );
}
