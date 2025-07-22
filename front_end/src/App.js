import "./App.css";
import { useState, useEffect } from "react";
import STATE from "./context/initState";
import reducer from "./context/reducer";
import { UserProvider } from "./context/context";
import { Route, Routes } from "react-router-dom";
import { useReducer } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Header from "./components/common/Header";
import Menu from "./components/common/Menu";
import Home from "./components/pages/Home";
import Category from "./components/pages/Category";

function App() {
  let storage = localStorage.getItem("state");
  if (storage != null) {
    storage = JSON.parse(storage);
  } else {
    storage = STATE;
  }
  const [state, dispatch] = useReducer(reducer, storage);
  return (
    <UserProvider value={{ state, dispatch }}>
      <div className="App">
        <div
          style={{
            position: "sticky",
            top: "0",
            zIndex: 1020,
            backgroundColor: "#f8f9fa",
          }}>
          <Header />
          <Menu />
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
