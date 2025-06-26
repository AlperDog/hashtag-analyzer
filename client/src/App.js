import React from "react";
import { Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import HashtagSearch from "./pages/HashtagSearch";
import Analytics from "./pages/Analytics";
import Trending from "./pages/Trending";
import HashtagDetail from "./pages/HashtagDetail";
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/search" element={<HashtagSearch />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/hashtag/:hashtag" element={<HashtagDetail />} />
            </Routes>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default App;
