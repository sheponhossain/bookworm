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
  const API_URL = 'http://localhost:5000/api';

  const [activeTab, setActiveTab] = useState('library');
  const [showModal, setShowModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  // const [genres, setGenres] = useState([]);

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

  const [genres, setGenres] = useState([
    'Programming',
    'Novel',
    'Science',
    'History',
  ]);
  const [newGenreInput, setNewGenreInput] = useState('');
  const [isEditingGenre, setIsEditingGenre] = useState(false);
  const [genreToEdit, setGenreToEdit] = useState(null);

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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchData = async () => {
    try {
      if (!user) return;
      const [bookRes, statsRes, genreRes, tutorialRes] = await Promise.all([
        axios.get('http://localhost:5000/api/books/all'),
        axios.get('http://localhost:5000/api/books/stats'),
        axios.get('http://localhost:5000/api/genres'),
        axios.get('http://localhost:5000/api/tutorials'),
      ]);

      setTutorials(tutorialRes.data);
      const fetchedBooks = bookRes.data.books || bookRes.data;
      setBooks(fetchedBooks);
      setStats(statsRes.data);

      if (genreRes.data && Array.isArray(genreRes.data)) {
        setGenres(genreRes.data);
      }

      const allPending = [];
      fetchedBooks.forEach((book) => {
        if (book.reviews && Array.isArray(book.reviews)) {
          book.reviews.forEach((rev) => {
            const currentStatus = rev.status
              ? rev.status.toLowerCase().trim()
              : 'pending';

            if (currentStatus === 'pending') {
              allPending.push({
                ...rev,
                bookId: book._id,
                bookTitle: book.title,
              });
            }
          });
        }
      });

      setPendingReviews(allPending);
      if (user && user.role?.toLowerCase() === 'admin') {
        const config = { headers: { 'user-role': user.role } };
        const userRes = await axios.get(
          'http://localhost:5000/api/admin/users',
          config
        );
        setAllUsers(userRes.data);
      }
    } catch (err) {
      console.error('Master Fetch Error:', err);
    }
  };

  const handleAddGenre = async (e) => {
    e.preventDefault();
    if (!newGenreInput.trim()) return;
    try {
      await axios.post(
        'http://localhost:5000/api/genres/add',
        { name: newGenreInput.trim() },
        { headers: { 'user-role': user.role } }
      );

      toast.success('Genre Added Successfully!');
      setNewGenreInput('');
      await fetchData();
    } catch (err) {
      toast.error('Failed to add genre or already exists');
    }
  };

  const handleGenreSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { 'user-role': user.role } };
      if (isEditingGenre) {
        await axios.put(
          `http://localhost:5000/api/genres/${genreToEdit}`,
          { newName: newGenreInput },
          config
        );
        toast.success('Genre Updated!');
      } else {
        await axios.post(
          'http://localhost:5000/api/genres/add',
          { name: newGenreInput },
          config
        );
        toast.success('Genre Added!');
      }
      setNewGenreInput('');
      setIsEditingGenre(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteGenre = async (id) => {
    if (!id) return toast.error('Invalid Genre ID');
    if (!window.confirm('Are you sure?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/genres/${id}`, {
        headers: { 'user-role': user.role },
      });
      toast.success('Genre deleted');
      fetchData();
    } catch (err) {
      toast.error(
        'Failed to delete: ' + (err.response?.data?.message || 'Server error')
      );
    }
  };
  const fetchPendingReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/reviews/pending`);
      setPendingReviews(res.data);
    } catch (err) {
      console.error('Error fetching reviews');
    }
  };

  const moderateReview = async (reviewId, bookId, action) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/reviews/moderate`,
        {
          reviewId,
          bookId,
          action,
        },
        {
          headers: { 'user-role': user.role },
        }
      );

      toast.success(`Review ${action === 'approve' ? 'Approved' : 'Deleted'}`);
      fetchData();
    } catch (err) {
      console.error('Moderation Action Error:', err);
      toast.error('Could not complete moderation');
    }
  };

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

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center font-serif italic text-2xl">
        Checking access...
      </div>
    );
  }

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || book.genre === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...genres];

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
      setFormData({
        title: book.title,
        author: book.author,
        genre: book.genre?.name || book.genre,
        coverImage: book.coverImage,
        description: book.description,
      });

      fetchData();
    } catch (err) {
      toast.error('Error saving book');
    }
  };

  const getYouTubeID = (url) => {
    if (!url) return null;

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

    const match = String(url).match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3728] font-sans">
      <Toaster position="top-right" />
      <div className="flex">
        <aside className="w-64 bg-white h-screen sticky top-0 border-r border-[#E5DCC3] p-6 flex flex-col shadow-sm">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-serif font-bold tracking-tighter">
              BOOK<span className="text-[#C1A88D]">WORM</span>
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
                  onClick={() => {
                    setActiveTab('reviews');
                  }}
                  icon="⭐"
                  label="Moderation"
                />
                <NavButton
                  active={activeTab === 'genres'}
                  onClick={() => setActiveTab('genres')}
                  icon="🏷️"
                  label="Genres"
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

        <main className="flex-1 p-10">
          <header className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-serif font-bold capitalize">
                {activeTab.replace('-', ' ')}
              </h1>
              <p className="text-gray-400 font-medium">
                Welcome back, BookWorm {user?.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user?.role === 'admin' && activeTab === 'library' && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      title: '',
                      author: '',
                      genre: '',
                      coverImage: '',
                      description: '',
                    });
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
                  className="px-6 py-4 bg-white border border-[#E5DCC3] rounded-2xl font-bold "
                >
                  {' '}
                  {categories.map((cat, index) => (
                    <option
                      key={cat._id ?? `${cat.name}-${index}`}
                      value={cat.name}
                    >
                      {cat.name}
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
                          onClick={() => {
                            setSelectedBook(book);
                            setIsDetailsOpen(true);
                          }}
                          className="flex-1 bg-[#F1F3F6] py-2 rounded-xl text-xs font-bold hover:bg-[#4A3728] hover:text-white transition-all"
                        >
                          Details
                        </button>
                        {user.role === 'admin' && (
                          <>
                            <button
                              onClick={() => {
                                setFormData(book);
                                setEditId(book._id);
                                setIsEditing(true);
                                setShowModal(true);
                              }}
                              className="p-2 bg-blue-50 text-blue-600 rounded-xl"
                            >
                              {' '}
                              ✏️{' '}
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book._id)}
                              className="p-2 bg-red-50 text-red-600 rounded-xl"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {/* --- USER MANAGEMENT --- */}
          {activeTab === 'user-mgmt' && user.role === 'admin' && (
            <div className="bg-white rounded-[40px] border border-[#E5DCC3] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F1F3F6]">
                  <tr>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      User
                    </th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      Email
                    </th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      Role
                    </th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-20 text-center text-gray-400 italic"
                      >
                        No users found in database
                      </td>
                    </tr>
                  ) : (
                    allUsers.map((u) => (
                      <tr
                        key={u._id}
                        className="border-t border-gray-100 hover:bg-[#FDFBF7] transition-colors"
                      >
                        <td className="p-6 flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#4A3728] text-white rounded-xl flex items-center justify-center font-bold">
                            {u.name?.charAt(0)}
                          </div>
                          <span className="font-bold text-sm">{u.name}</span>
                        </td>
                        <td className="p-6 text-sm text-gray-500">{u.email}</td>
                        <td className="p-6">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <button
                            onClick={() => setViewingUser(u)}
                            className="bg-[#F1F3F6] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#4A3728] hover:text-white transition-all"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          {/* --- MODERATION / REVIEWS TAB --- */}
          {activeTab === 'reviews' && user.role === 'admin' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h3 className="text-xl font-serif font-bold">
                  Pending Reviews
                </h3>
                <p className="text-sm text-gray-400">
                  Approve or remove reader feedback from the library.
                </p>
              </div>

              {pendingReviews && pendingReviews.length > 0 ? (
                pendingReviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="bg-white p-6 rounded-[25px] border border-[#E5DCC3] flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm hover:shadow-md transition-all gap-4"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-[#4A3728] text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-inner">
                        {rev?.userName?.charAt(0) || 'R'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-sm text-[#4A3728]">
                            {rev?.userName || 'Anonymous Reader'}
                          </span>
                          <div className="flex text-yellow-500 text-[10px]">
                            {'★'.repeat(rev.rating || 5)}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm italic leading-relaxed bg-[#FDFBF7] p-2 rounded-lg border border-dashed border-[#E5DCC3]">
                          {rev.comment}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#C1A88D]">
                            Target Book:
                          </span>
                          <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
                            {rev.bookTitle || 'Unknown Title'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={() =>
                          moderateReview(rev._id, rev.bookId, 'approve')
                        }
                        className="flex-1 md:flex-none bg-green-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg active:scale-95"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          moderateReview(rev._id, rev.bookId, 'delete')
                        }
                        className="flex-1 md:flex-none bg-red-50 text-red-500 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100 active:scale-95"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-[#E5DCC3] flex flex-col items-center">
                  <span className="text-5xl mb-4 opacity-20">✨</span>
                  <p className="text-gray-400 font-serif italic text-lg">
                    No reviews pending moderation
                  </p>
                </div>
              )}
            </div>
          )}
          {activeTab === 'genres' && user.role === 'admin' && (
            <div className="bg-white p-10 rounded-[40px] border border-[#E5DCC3] shadow-sm max-w-2xl">
              <h2 className="text-2xl font-serif font-bold mb-6">
                Manage Genres
              </h2>

              <form onSubmit={handleGenreSubmit} className="flex gap-4 mb-8">
                <input
                  type="text"
                  placeholder="Genre name"
                  value={newGenreInput}
                  onChange={(e) => setNewGenreInput(e.target.value)}
                  className="flex-1 p-4 bg-[#F1F3F6] rounded-2xl outline-none font-medium"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#4A3728] text-white px-6 rounded-2xl font-bold"
                >
                  {isEditingGenre ? 'Update' : 'Add'}
                </button>
                {isEditingGenre && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingGenre(false);
                      setNewGenreInput('');
                    }}
                    className="bg-gray-100 text-gray-500 px-4 rounded-2xl"
                  >
                    Cancel
                  </button>
                )}
              </form>

              <div className="space-y-3">
                {genres.length === 0 ? (
                  <p className="text-gray-400 italic">No genres found</p>
                ) : (
                  genres.map((g) => (
                    <div
                      key={g._id}
                      className="flex justify-between items-center bg-[#FDFBF7] p-4 rounded-2xl border border-[#E5DCC3]"
                    >
                      <span className="font-bold">{g.name}</span>
                      <div className="flex gap-4">
                        <button
                          onClick={() => {
                            setIsEditingGenre(true);
                            setGenreToEdit(g._id);
                            setNewGenreInput(g.name);
                          }}
                          className="text-blue-600 font-bold text-sm hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteGenre(g._id)}
                          className="text-red-500 font-bold text-sm hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
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
                    {' '}
                    Embed Video{' '}
                  </button>
                </form>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorials && tutorials.length > 0 ? (
                  tutorials.map((tut) => {
                    const videoId = getYouTubeID(tut.url || tut.videoUrl);

                    return (
                      <div
                        key={tut._id}
                        className="bg-white rounded-[30px] overflow-hidden border border-[#E5DCC3] shadow-sm group"
                      >
                        {videoId ? (
                          <iframe
                            className="w-full aspect-video"
                            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                            title={tut.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <div className="w-full aspect-video bg-gray-100 flex items-center justify-center text-gray-400 italic text-xs">
                            Video link unavailable
                          </div>
                        )}

                        <div className="p-4">
                          <h3 className="font-bold text-sm text-center line-clamp-2">
                            {tut.title}
                          </h3>

                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDelete(tut._id)}
                              className="mt-2 w-full text-[10px] text-red-400 uppercase font-black hover:text-red-600 transition-colors"
                            >
                              Remove Tutorial
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-10 text-gray-400 italic">
                    No tutorials found in the archive.
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      {/* --- MODALS --- */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[40px] w-1/3 max-md p-10 shadow-2xl border border-[#E5DCC3] text-center">
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
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  viewingUser.role === 'admin'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-green-50 text-green-600'
                }`}
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
                  className="bg-[#F1F3F6] rounded-2xl p-4 font-bold text-xs outline-none w-full"
                >
                  <option value="">Select Genre</option>
                  {/* div এবং span সরিয়ে সরাসরি option ট্যাগ ব্যবহার করুন */}
                  {genres &&
                    genres.map((g) => (
                      <option key={g._id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
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

      {/* --- BOOK DETAILS MODAL --- */}
      {isDetailsOpen && selectedBook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-[#4A3728]">
                Book Information
              </h2>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col md:flex-row p-6 gap-8 max-h-[70vh] overflow-y-auto">
              {/* Cover Image */}
              <div className="w-full md:w-2/5">
                <img
                  src={selectedBook.coverImage}
                  alt={selectedBook.title}
                  className="w-full h-80 object-cover rounded-[24px] shadow-lg"
                />
              </div>

              {/* Info Content */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-black text-gray-800">
                    {selectedBook.title}
                  </h3>
                  <p className="text-[#4A3728] font-bold italic">
                    {selectedBook.author}
                  </p>
                </div>

                <div className="flex gap-4 text-xs font-bold uppercase text-gray-500">
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    {selectedBook.genre}
                  </span>
                  <span className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full">
                    ★ {selectedBook.avgRating || 0}
                  </span>
                </div>

                <div className="bg-[#F1F3F6] p-5 rounded-[20px]">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-2">
                    Description
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedBook.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setFormData(selectedBook);
                  setIsEditing(true);
                  setIsDetailsOpen(false);
                  setEditId(selectedBook._id);
                  setShowModal(true);
                }}
                className="flex-1 bg-[#4A3728] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all"
              >
                Edit Book
              </button>

              <button
                onClick={() => {
                  handleDeleteGenre(selectedBook._id);
                  setIsDetailsOpen(false);
                }}
                className="flex-1 bg-red-50 text-red-600 border border-red-200 py-3 rounded-xl font-bold hover:bg-red-50 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold text-sm transition-all ${
        active
          ? 'bg-[#4A3728] text-white shadow-md'
          : 'text-gray-500 hover:bg-[#FDFBF7]'
      }`}
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
