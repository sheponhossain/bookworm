/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    displayName: '',
    photoURL: '',
    bio: 'Avid reader and book collector.',
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (user) {
      setFormData({
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        bio: formData.bio,
      });
    }
  }, [user, authLoading, router]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully! ✨', {
        style: { borderRadius: '15px', background: '#4A3728', color: '#fff' },
      });
    } catch (error) {
      toast.error('Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading)
    return (
      <div className="h-screen flex items-center justify-center font-serif italic text-xl">
        Loading profile...
      </div>
    );
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3728] p-8 md:p-12">
      <Toaster position="top-center" />

      <div className="max-w-3xl mx-auto bg-white rounded-[50px] border border-[#E5DCC3] overflow-hidden shadow-sm">
        {/* Profile Cover/Header */}
        <div className="h-32 bg-[#4A3728] relative">
          <div className="absolute -bottom-12 left-12">
            <img
              src={formData.photoURL || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="w-24 h-24 rounded-3xl border-4 border-white object-cover shadow-lg bg-white"
            />
          </div>
        </div>

        <div className="p-12 pt-16">
          <header className="mb-10">
            <h1 className="text-3xl font-serif font-bold">
              Account <span className="italic text-[#C1A88D]">Settings</span>
            </h1>
            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">
              Personalize your literary identity
            </p>
          </header>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Display Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-[#F8F5F0] rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#C1A88D]/20 transition-all font-medium"
                  placeholder="Enter your name"
                />
              </div>

              {/* Photo URL */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                  Photo URL
                </label>
                <input
                  type="text"
                  value={formData.photoURL}
                  onChange={(e) =>
                    setFormData({ ...formData, photoURL: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-[#F8F5F0] rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#C1A88D]/20 transition-all font-medium"
                  placeholder="Paste image link"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                About You
              </label>
              <textarea
                rows="3"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="w-full px-6 py-4 bg-[#F8F5F0] rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#C1A88D]/20 transition-all font-medium resize-none"
              ></textarea>
            </div>

            <div className="pt-6 flex items-center justify-between border-t border-gray-100">
              <p className="text-[10px] text-gray-300 italic italic font-serif">
                Registered Email: {user.email}
              </p>
              <button
                type="submit"
                disabled={isUpdating}
                className="bg-[#4A3728] text-white px-10 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
