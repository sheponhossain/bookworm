/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // --- UI STATES ---
  const [activeTab, setActiveTab] = useState('library');
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  // --- DATA STATES ---
  const [books, setBooks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeUsers: 0,
    totalReviews: 0,
    readingGoal: '80%',
  });

  // --- FORM STATES ---
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    coverImage: '',
    description: '',
  });
  const [tutorialData, setTutorialData] = useState({ title: '', videoUrl: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // --- NEW STATES FOR SEARCH & FILTER ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // --- API FETCHING ---
  const fetchData = async () => {
    try {
      if (!user) return;
      const config = { headers: { 'user-role': user.role } };
      const [bookRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/books/all'),
        axios.get('http://localhost:5000/api/books/stats'),
      ]);
      setBooks(bookRes.data.books || bookRes.data);
      setStats(statsRes.data);

      if (user.role === 'admin') {
        const [userRes, reviewRes, tutRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/users', config),
          axios.get('http://localhost:5000/api/admin/reviews/pending', config),
          axios.get('http://localhost:5000/api/tutorials', config),
        ]);
        setAllUsers(userRes.data);
        setPendingReviews(reviewRes.data);
        setTutorials(tutRes.data);
      }
    } catch (err) {
      console.error('Data Fetch Error:', err);
    }
  };

  // --- HOOKS (এগুলো সব উপরে থাকতে হবে) ---
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchData();

    const interval = setInterval(() => {
      if (user) fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // --- এবার আপনি কন্ডিশনাল রিটার্ন দিতে পারবেন ---
  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center font-serif italic text-2xl">
        Checking access...
      </div>
    );
  }

  // --- SEARCH & FILTER LOGIC ---
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || book.genre === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(books.map((book) => book.genre))];

  // --- ADMIN ACTIONS ---
  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { 'user-role': user.role } }
      );
      toast.success(`User updated to ${newRole}!`);
      fetchData();
      if (viewingUser) setViewingUser({ ...viewingUser, role: newRole });
    } catch (err) {
      toast.error('Role update failed');
    }
  };

  const moderateReview = async (reviewId, bookId, action) => {
    try {
      const config = { headers: { 'user-role': user.role } };
      if (action === 'approve') {
        await axios.put(
          `http://localhost:5000/api/admin/reviews/${reviewId}/approve`,
          {},
          config
        );
        toast.success('Review Approved!');
      } else {
        await axios.delete(
          `http://localhost:5000/api/admin/reviews/${reviewId}`,
          config
        );
        toast.error('Review Deleted');
      }
      fetchData();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleAddTutorial = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/admin/tutorials',
        tutorialData,
        { headers: { 'user-role': user.role } }
      );
      toast.success('Tutorial Embedded!');
      setTutorialData({ title: '', videoUrl: '' });
      fetchData();
    } catch (err) {
      toast.error('Failed to add tutorial');
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    const config = { headers: { 'user-role': user.role } };
    try {
      if (isEditing) {
        await axios.put(
          `http://localhost:5000/api/books/${editId}`,
          formData,
          config
        );
        toast.success('Book Updated!');
      } else {
        await axios.post(
          'http://localhost:5000/api/books/add',
          formData,
          config
        );
        toast.success('New Book Added!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error('Error saving book');
    }
  };

  const getYouTubeID = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // --- আপনার অরিজিনাল ডিজাইন শুরু ---
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3728] font-sans">
      <Toaster position="top-right" />

      <div className="flex">
        {/* --- Sidebar --- */}
        <aside className="w-64 bg-white h-screen sticky top-0 border-r border-[#E5DCC3] p-6 flex flex-col shadow-sm">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-serif font-bold tracking-tighter">
              Lumina<span className="text-[#C1A88D]">Books</span>
            </h2>
            <p className="text-[10px] uppercase tracking-[3px] mt-1 font-bold text-gray-400">
              Management System
            </p>
          </div>

          <nav className="flex-1 space-y-2">
            <NavButton
              active={activeTab === 'library'}
              onClick={() => setActiveTab('library')}
              icon="📚"
              label="Library"
            />
            <NavButton
              active={activeTab === 'tutorials'}
              onClick={() => setActiveTab('tutorials')}
              icon="🎥"
              label="Tutorials"
            />
            {user?.role === 'admin' && (
              <>
                <div className="pt-6 pb-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Admin Control
                </div>
                <NavButton
                  active={activeTab === 'user-mgmt'}
                  onClick={() => setActiveTab('user-mgmt')}
                  icon="👥"
                  label="Users"
                />
                <NavButton
                  active={activeTab === 'reviews'}
                  onClick={() => setActiveTab('reviews')}
                  icon="⭐"
                  label="Moderation"
                />
              </>
            )}
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-100">
              <p className="text-[10px] font-black uppercase text-green-600 tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Database Active Users
              </p>
              <p className="text-xl font-bold text-green-700">
                {allUsers.length || stats.activeUsers}
              </p>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 p-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-all"
            >
              <span>🚪</span> Logout
            </button>
          </div>
        </aside>

        {/* --- Main Content --- */}
        <main className="flex-1 p-10">
          <header className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-serif font-bold capitalize">
                {activeTab.replace('-', ' ')}
              </h1>
              <p className="text-gray-400 font-medium">
                Welcome back, Librarian {user?.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user?.role === 'admin' && activeTab === 'library' && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setShowModal(true);
                  }}
                  className="bg-[#4A3728] text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all"
                >
                  + Add New Book
                </button>
              )}
              <img
                src={
                  user?.photoURL ||
                  `https://ui-avatars.com/api/?name=${user?.name}`
                }
                className="w-12 h-12 rounded-2xl border-2 border-white shadow-md cursor-pointer"
              />
            </div>
          </header>

          {/* Library View */}
          {activeTab === 'library' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <StatCard
                  label="Total Collection"
                  value={stats.totalBooks}
                  color="bg-blue-50 text-blue-600"
                />
                <StatCard
                  label="Live Database Users"
                  value={allUsers.length || stats.activeUsers}
                  color="bg-green-50 text-green-600"
                />
                <StatCard
                  label="Total Reviews"
                  value={stats.totalReviews}
                  color="bg-yellow-50 text-yellow-600"
                />
                <StatCard
                  label="System Load"
                  value="Optimal"
                  color="bg-purple-50 text-purple-600"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-10">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">
                    🔍
                  </span>
                  <input
                    type="text"
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-[#E5DCC3] rounded-2xl outline-none"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-6 py-4 bg-white border border-[#E5DCC3] rounded-2xl font-bold"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBooks.map((book) => (
                  <div
                    key={book._id}
                    className="bg-white rounded-[30px] overflow-hidden shadow-sm border border-[#E5DCC3] group hover:shadow-xl transition-all duration-500"
                  >
                    <div className="h-48 bg-gray-100 relative overflow-hidden">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          alt={book.title}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs">
                          No Cover Image
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                        {book.genre}
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="text-lg font-bold truncate">
                        {book.title}
                      </h4>
                      <p className="text-gray-400 text-sm mb-4 font-medium">
                        by {book.author}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedBook(book)}
                          className="flex-1 bg-[#F1F3F6] py-2 rounded-xl text-xs font-bold hover:bg-[#4A3728] hover:text-white transition-all"
                        >
                          Details
                        </button>
                        {user.role === 'admin' && (
                          <button
                            onClick={() => {
                              setFormData(book);
                              setEditId(book._id);
                              setIsEditing(true);
                              setShowModal(true);
                            }}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl"
                          >
                            ✏️
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* User Management View */}
          {activeTab === 'user-mgmt' && user.role === 'admin' && (
            <div className="bg-white rounded-[35px] border border-[#E5DCC3] overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-[#FDFBF7]">
                  <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <th className="p-6">Member</th>
                    <th className="p-6">Current Role</th>
                    <th className="p-6">Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allUsers.map((u) => (
                    <tr
                      key={u._id}
                      className="group hover:bg-[#FDFBF7] transition-all"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://ui-avatars.com/api/?name=${u.name}`}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-bold text-sm">{u.name}</p>
                            <p className="text-xs text-gray-400 font-medium">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${u.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-6">
                        <button
                          onClick={() => setViewingUser(u)}
                          className="bg-[#F1F3F6] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#4A3728] hover:text-white transition-all"
                        >
                          🔍 View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Review Moderation View */}
          {activeTab === 'reviews' && user.role === 'admin' && (
            <div className="space-y-4">
              {pendingReviews.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-200 text-gray-400 italic">
                  No reviews pending moderation ✨
                </div>
              ) : (
                pendingReviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="bg-white p-6 rounded-[25px] border border-[#E5DCC3] flex justify-between items-center shadow-sm"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 bg-[#F1F3F6] rounded-full flex items-center justify-center font-bold">
                        {rev.userName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-sm">
                            {rev.userName}
                          </span>
                          <span className="text-yellow-500 text-xs">
                            {'⭐'.repeat(rev.rating)}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm italic">
                          {rev.comment}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          moderateReview(rev._id, rev.bookId, 'approve')
                        }
                        className="bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:shadow-lg transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          moderateReview(rev._id, rev.bookId, 'delete')
                        }
                        className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tutorials View */}
          {activeTab === 'tutorials' && (
            <div>
              {user.role === 'admin' && (
                <form
                  onSubmit={handleAddTutorial}
                  className="mb-10 bg-white p-8 rounded-[30px] border border-[#E5DCC3] flex gap-4 items-end shadow-sm"
                >
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400">
                      Tutorial Title
                    </label>
                    <input
                      type="text"
                      value={tutorialData.title}
                      onChange={(e) =>
                        setTutorialData({
                          ...tutorialData,
                          title: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-[#F1F3F6] rounded-xl outline-none text-sm font-medium"
                      placeholder="Ex: Programming for Beginners"
                      required
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400">
                      YouTube URL
                    </label>
                    <input
                      type="url"
                      value={tutorialData.videoUrl}
                      onChange={(e) =>
                        setTutorialData({
                          ...tutorialData,
                          videoUrl: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-[#F1F3F6] rounded-xl outline-none text-sm font-medium"
                      placeholder="Paste link here..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#4A3728] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md"
                  >
                    Embed Video
                  </button>
                </form>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorials.map((tut) => (
                  <div
                    key={tut._id}
                    className="bg-white rounded-[30px] overflow-hidden border border-[#E5DCC3] shadow-sm"
                  >
                    <iframe
                      className="w-full aspect-video"
                      src={`https://www.youtube.com/embed/${getYouTubeID(tut.videoUrl)}`}
                      title={tut.title}
                      allowFullScreen
                    ></iframe>
                    <div className="p-4 font-bold text-sm text-center">
                      {tut.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- MODALS (User, Book, etc.) --- */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl border border-[#E5DCC3] text-center">
            <div className="w-24 h-24 bg-[#FDFBF7] rounded-3xl mx-auto mb-6 flex items-center justify-center border-2 border-[#E5DCC3] overflow-hidden">
              <img
                src={`https://ui-avatars.com/api/?name=${viewingUser.name}&size=128`}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-serif font-bold">
              {viewingUser.name}
            </h2>
            <p className="text-gray-400 mb-6">{viewingUser.email}</p>
            <div className="bg-[#F1F3F6] p-4 rounded-2xl mb-8 flex justify-between items-center">
              <span className="text-xs font-black uppercase text-gray-500">
                System Role
              </span>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${viewingUser.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}
              >
                {viewingUser.role}
              </span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() =>
                  handleRoleChange(
                    viewingUser._id,
                    viewingUser.role === 'user' ? 'admin' : 'user'
                  )
                }
                className="flex-1 bg-[#4A3728] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-black transition-all"
              >
                {viewingUser.role === 'user' ? 'Promote' : 'Demote'}
              </button>
              <button
                onClick={() => setViewingUser(null)}
                className="px-6 bg-gray-100 py-4 rounded-2xl font-bold text-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl overflow-y-auto max-h-[90vh] border border-[#E5DCC3]">
            <h2 className="text-3xl font-serif font-bold text-center mb-6">
              {isEditing ? 'Edit Classic' : 'Add New Treasure'}
            </h2>
            <form onSubmit={handleBookSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Book Title"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full p-4 bg-[#F1F3F6] rounded-2xl outline-none font-medium"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Author"
                  required
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  className="flex-1 p-4 bg-[#F1F3F6] rounded-2xl outline-none font-medium"
                />
                <select
                  value={formData.genre}
                  onChange={(e) =>
                    setFormData({ ...formData, genre: e.target.value })
                  }
                  className="bg-[#F1F3F6] rounded-2xl p-4 font-bold text-xs"
                >
                  <option value="">Genre</option>
                  <option value="Programming">Programming</option>
                  <option value="Novel">Novel</option>
                  <option value="Science">Science</option>
                  <option value="History">History</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Cover Image URL"
                required
                value={formData.coverImage}
                onChange={(e) =>
                  setFormData({ ...formData, coverImage: e.target.value })
                }
                className="w-full p-4 bg-[#F1F3F6] rounded-2xl outline-none font-medium"
              />
              <textarea
                placeholder="Tell us about the book..."
                rows="4"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-4 bg-[#F1F3F6] rounded-2xl outline-none resize-none font-medium"
              ></textarea>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#4A3728] text-white py-4 rounded-2xl font-bold shadow-lg transition-all"
                >
                  {isEditing ? 'Update' : 'Publish'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-8 bg-gray-100 py-4 rounded-2xl font-bold text-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SMALL COMPONENTS ---
function NavButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold text-sm transition-all ${active ? 'bg-[#4A3728] text-white shadow-md' : 'text-gray-500 hover:bg-[#FDFBF7]'}`}
    >
      <span className="text-lg">{icon}</span> {label}
    </button>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div
      className={`p-6 rounded-[30px] ${color} shadow-sm border border-white/50 flex flex-col items-center justify-center`}
    >
      <span className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">
        {label}
      </span>
      <span className="text-3xl font-black">{value}</span>
    </div>
  );
}
