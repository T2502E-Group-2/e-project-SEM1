import React, { createContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    // Lấy dữ liệu giỏ hàng từ localStorage khi khởi tạo
    const localData = localStorage.getItem("cart");
    return localData ? JSON.parse(localData) : [];
  });

  // useEffect để lưu giỏ hàng vào localStorage mỗi khi nó thay đổi
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
