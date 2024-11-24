import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Services from './pages/Services/Services';
import Staff from './pages/Staff/Staff';
import News from './pages/News/News';
import Login from './pages/Login/Login';

function App() {
  
  return (
    <Router>
        <Navbar />
        <div style={{ padding: "1rem" }}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/pocetna" element={<Home />} />
                <Route path="/usluge" element={<Services />} />
                <Route path="/osoblje" element={<Staff />} />
                <Route path="/vesti" element={<News />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </div>
    </Router>
);
};

export default App
