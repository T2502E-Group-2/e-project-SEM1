import "./App.css";
import { useState, useEffect, useReducer } from "react";
import STATE from "./context/initState";
import reducer from "./context/reducer";
import { UserProvider } from "./context/context";
import { Route, Routes } from "react-router-dom";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import Home from "./components/pages/Home";
import Category from "./components/pages/Category";
import ActivityDetail from "./components/pages/ActivityDetail";
import EquipmentPage from "./components/pages/EquipmentPage";

function App() {
  const [scrolled, setScrolled] = useState(false);

  let storage = localStorage.getItem("state");
  if (storage != null) {
    storage = JSON.parse(storage);
  } else {
    storage = STATE;
  }
  const [state, dispatch] = useReducer(reducer, storage);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <UserProvider value={{ state, dispatch }}>
      <div className="App">
        <div
          className={`header-and-menu-container ${scrolled ? "scrolled" : ""}`}>
          <Header />
        </div>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:id" element={<Category />} />
            <Route path="/activity/:id" element={<ActivityDetail />} />
            <Route path="/equipment" element={<EquipmentPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </UserProvider>
  );
}

export default App;
