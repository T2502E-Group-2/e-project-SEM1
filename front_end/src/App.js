import "./App.css";
import { useState, useEffect, useReducer } from "react";
import STATE from "./context/initState";
import reducer from "./context/reducer";
import { UserProvider } from "./context/context";
import { Route, Routes } from "react-router-dom";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Header from "./components/common/Header";
import Home from "./components/pages/Home";
import Category from "./components/pages/Category";

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
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

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
            {/* Add other routes here */}
          </Routes>
        </main>
      </div>
    </UserProvider>
  );
}

export default App;
