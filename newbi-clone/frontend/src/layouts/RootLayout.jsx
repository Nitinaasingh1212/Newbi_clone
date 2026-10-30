import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export const RootLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F2EC] dark:bg-[#050505] text-gray-950 dark:text-white transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
