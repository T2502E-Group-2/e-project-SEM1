import "./App.css";
import { useState, useEffect } from "react";
import STATE from "./context/initState";
import reducer from "./context/reducer";
import { UserProvider } from "./context/context";
import { Route, Routes } from "react-router-dom";
import { useReducer } from "react";

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
            position: "relative",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
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
