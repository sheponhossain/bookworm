'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    photoURL: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        formData
      );
      alert('Registration Successful! 📚');
      router.push('/auth/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FDFBF7] py-10">
      <div className="w-full max-w-md p-8 bg-white border border-[#E5DCC3] rounded-2xl shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-serif font-bold text-[#4A3728]">
            BookWorm 📚
          </h2>
          <p className="text-gray-600 mt-1">Create your library account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-[#4A3728]">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="Enter your full name"
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4A3728] text-gray-800 bg-white"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-[#4A3728]">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="example@mail.com"
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4A3728] text-gray-800 bg-white"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-sm font-semibold text-[#4A3728]">
              Profile Photo URL
            </label>
            <input
              type="url"
              placeholder="https://image-link.com"
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4A3728] text-gray-800 bg-white"
              onChange={(e) =>
                setFormData({ ...formData, photoURL: e.target.value })
              }
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-[#4A3728]">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4A3728] text-gray-800 bg-white"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-[#4A3728]">
              I want to join as:
            </label>
            <select
              className="w-full p-3 border rounded-lg bg-white text-gray-800"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="user">Reader (User)</option>
              <option value="admin">Librarian (Admin)</option>
            </select>
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#4A3728] text-white py-3 rounded-lg font-bold hover:bg-[#3d2d21] transition-all shadow-lg mt-4"
          >
            {loading ? 'Creating Account...' : 'Register Now'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-700">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-[#4A3728] font-bold hover:underline underline-offset-4"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
