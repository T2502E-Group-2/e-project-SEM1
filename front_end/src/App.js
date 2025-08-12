import "./App.css";
import { useState, useEffect, useReducer } from "react";
import STATE from "./context/initState";
import reducer from "./context/reducer";
import { CartProvider } from "./context/CartContext";
import { UserProvider } from "./context/context";
import { Route, Routes } from "react-router-dom";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Header from "./components/common/Header";
import SearchResultsPage from "./components/common/SearchResultsPage";
import Footer from "./components/common/Footer";
import Home from "./components/pages/Home";
import Profile from "./components/pages/Profile";
import AboutPage from "./components/pages/AboutPage";
import Cart from "./components/common/Cart";
import Category from "./components/shared/Category";
import AdminOrder from "./components/Admin/AdminOrder";

import ActivityPage from "./components/pages/Activities/ActivityPage";
import ActivityDetail from "./components/pages/Activities/ActivityDetail";
import ActivityBooking from "./components/pages/Activities/ActivityBooking";

import EquipmentPage from "./components/pages/Equipments/EquipmentPage";
import EquipmentDetail from "./components/pages/Equipments/EquipmentDetail";

import PostPage from "./components/pages/Posts/PostPage";
import PostDetailPage from "./components/pages/Posts/PostDetailPage";

function App() {
  const [scrolled, setScrolled] = useState(false);

  // Initialize state for UserContext
  const initialUser = JSON.parse(localStorage.getItem("user")) || null;
  const initialState = {
    ...STATE, // Includes cart: [] from initState
    user: initialUser,
  };
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <CartProvider>
      <UserProvider value={{ state, dispatch }}>
        <div className="App">
          <div
            className={`header-and-menu-container ${
              scrolled ? "scrolled" : ""
            }`}
          >
            <Header />
          </div>
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/category/:id" element={<Category />} />
              <Route path="/admin/order" element={<AdminOrder />} />
              <Route path="/search" element={<SearchResultsPage />} />

              <Route path="/activities" element={<ActivityPage />} />
              <Route path="/activities/:id" element={<ActivityDetail />} />
              <Route
                path="/activity/:id/booking"
                element={<ActivityBooking />}
              />

              <Route path="/equipment" element={<EquipmentPage />} />
              <Route path="/equipment/:id" element={<EquipmentDetail />} />

              <Route path="/posts" element={<PostPage />} />
              <Route path="/posts/:id/:slug" element={<PostDetailPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </UserProvider>
    </CartProvider>
  );
}

export default App;
