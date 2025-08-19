import React, { createContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    //Get shopping cart data from localstorage when creating
    const localData = localStorage.getItem("cart");
    return localData ? JSON.parse(localData) : [];
  });

  // useEffect to store shopping carts into localstorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id);
      if (existingItem) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prevCart, item];
    });
  };

  const cartItemCount = cart.length;

  return (
    <CartContext.Provider value={{ cart, addToCart, cartItemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
