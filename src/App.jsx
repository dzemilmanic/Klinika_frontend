import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Services from './pages/Services/Services';
import Staff from './pages/Staff/Staff';
import News from './pages/News/News';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Footer from './components/Footer/Footer'


function App() {
  
  return (
    <Router>
        <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/pocetna" element={<Home />} />
                <Route path="/usluge" element={<Services />} />
                <Route path="/osoblje" element={<Staff />} />
                <Route path="/vesti" element={<News />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        <Footer/>
    </Router>
);
};

export default App
