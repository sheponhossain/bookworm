// src/app/layout.js
import { AuthProvider } from '@/context/AuthContext'; // আপনার AuthContext এর পাথ অনুযায়ী

import { Footer } from '@/components/Footer';
import './globals.css';
import Navbar from '@/components/Nabvar';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {/* এখন Navbar এবং সব পেজ Auth ডাটা এক্সেস করতে পারবে */}
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
