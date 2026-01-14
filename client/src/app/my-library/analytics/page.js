'use client';
import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';

export default function AnalyticsPage() {
  // কালার প্যালেট (আপনার থিমের সাথে মিল রেখে)
  const COLORS = ['#4A3728', '#C1A88D', '#E5DCC3', '#8B5E3C', '#A69076'];

  // ডামি ডাটা (এগুলো পরে আপনার এপিআই থেকে আসবে)
  const genreData = [
    { name: 'Programming', value: 400 },
    { name: 'Novel', value: 300 },
    { name: 'Science', value: 200 },
    { name: 'History', value: 100 },
  ];

  const monthlyData = [
    { name: 'Jan', books: 4 },
    { name: 'Feb', books: 7 },
    { name: 'Mar', books: 5 },
    { name: 'Apr', books: 8 },
  ];

  const pageProgressData = [
    { day: 'Mon', pages: 20 },
    { day: 'Tue', pages: 45 },
    { day: 'Wed', pages: 30 },
    { day: 'Thu', pages: 70 },
    { day: 'Fri', pages: 50 },
  ];

  const readingProgress = 75; // Circular Progress এর জন্য (%)

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8 text-[#4A3728]">
      <header className="mb-10">
        <h1 className="text-4xl font-serif font-bold">Reading Insights</h1>
        <p className="text-gray-500">Track your literary journey and habits</p>
      </header>

      {/* --- TOP STATS & CIRCULAR PROGRESS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {/* Circular Progress Card */}
        <div className="bg-white p-8 rounded-[40px] border border-[#E5DCC3] shadow-sm flex flex-col items-center justify-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                className="text-[#F1F3F6] stroke-current"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#4A3728] stroke-current"
                strokeWidth="3"
                strokeDasharray={`${readingProgress}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black">{readingProgress}%</span>
              <span className="text-[10px] uppercase font-bold text-gray-400">
                Goal Met
              </span>
            </div>
          </div>
          <p className="mt-4 font-bold text-sm">Yearly Reading Goal</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <StatMiniCard
            label="Books Read"
            value="24"
            icon="📚"
            color="bg-blue-50 text-blue-600"
          />
          <StatMiniCard
            label="Total Pages"
            value="12,450"
            icon="📄"
            color="bg-green-50 text-green-600"
          />
          <StatMiniCard
            label="Avg Rating"
            value="4.8"
            icon="⭐"
            color="bg-yellow-50 text-yellow-600"
          />
          <StatMiniCard
            label="Reading Streak"
            value="12 Days"
            icon="🔥"
            color="bg-orange-50 text-orange-600"
          />
        </div>
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart: Genre Breakdown */}
        <div className="bg-white p-8 rounded-[40px] border border-[#E5DCC3] shadow-sm">
          <h3 className="text-xl font-bold mb-6 font-serif">Favorite Genres</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genreData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genreData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Monthly Books */}
        <div className="bg-white p-8 rounded-[40px] border border-[#E5DCC3] shadow-sm">
          <h3 className="text-xl font-bold mb-6 font-serif">
            Monthly Progress
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F3F6"
                />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#FDFBF7' }} />
                <Bar
                  dataKey="books"
                  fill="#4A3728"
                  radius={[10, 10, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart: Pages over Time */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-[#E5DCC3] shadow-sm">
          <h3 className="text-xl font-bold mb-6 font-serif">
            Reading Consistency (Pages/Day)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pageProgressData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F3F6"
                />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="pages"
                  stroke="#4A3728"
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#4A3728' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini Stat Card Component
function StatMiniCard({ label, value, icon, color }) {
  return (
    <div
      className={`p-6 rounded-3xl border border-[#E5DCC3] bg-white flex items-center gap-4 hover:shadow-md transition-all`}
    >
      <div
        className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-xl shadow-sm`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
          {label}
        </p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
