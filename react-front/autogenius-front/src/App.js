import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import axios from "axios";
import NewsDetail from "./components/NewsDetail";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Legals from "./components/Legals";
import ScrollToTop from "./utils/ScrollToTop";
import About from "./components/About";
import Contact from "./components/Contact";
import { AuthProvider } from "./auth/AuthProvider";

axios.defaults.baseURL = "http://localhost:8001/";
axios.defaults.headers.common["Authorization"] = "Bearer votre_token";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Navbar />
        <div className="container" id="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/news/:slug" element={<NewsDetail />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/legals" element={<Legals />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
