import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ReadingTracker({
  book,
  currentStatus,
  pagesRead,
  totalPages,
}) {
  const [status, setStatus] = useState(currentStatus || 'Want to Read');
  const [progress, setProgress] = useState(pagesRead || 0);

  const updateLibrary = async (newStatus, newProgress) => {
    try {
      await axios.post('/api/library/update', {
        bookId: book._id,
        shelf: newStatus,
        pagesRead: newProgress,
      });
      toast.success('Library updated!');
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const percent = Math.round((progress / totalPages) * 100) || 0;

  return (
    <div className="bg-[#FDFBF7] p-6 rounded-3xl border border-[#E5DCC3] mt-4">
      <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">
        My Library Shelf
      </h4>

      <div className="flex gap-2 mb-6">
        {['Want to Read', 'Currently Reading', 'Read'].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              updateLibrary(s, progress);
            }}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${status === s ? 'bg-[#4A3728] text-white' : 'bg-white text-gray-400 border'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {status === 'Currently Reading' && (
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold">
            <span>Progress: {percent}%</span>
            <span>
              {progress} / {totalPages} pages
            </span>
          </div>
          <input
            type="range"
            max={totalPages}
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            onMouseUp={() => updateLibrary(status, progress)}
            className="w-full accent-[#C1A88D]"
          />
        </div>
      )}
    </div>
  );
}
