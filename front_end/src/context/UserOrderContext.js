import React, { createContext, useReducer } from "react";

// Tạo UserOrderContext
const UserOrderContext = createContext();

// Definition of Action Types for order management
export const FETCH_ORDERS_REQUEST = "FETCH_ORDERS_REQUEST";
export const FETCH_ORDERS_SUCCESS = "FETCH_ORDERS_SUCCESS";
export const FETCH_ORDERS_FAILURE = "FETCH_ORDERS_FAILURE";

// Initial state
const initialState = {
  orders: [],
  loading: false,
  error: null,
};

// Action creator functions
const orderReducer = (state, action) => {
  switch (action.type) {
    case FETCH_ORDERS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_ORDERS_SUCCESS:
      return { ...state, loading: false, orders: action.payload };
    case FETCH_ORDERS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Component Provider
export const UserOrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  return (
    <UserOrderContext.Provider value={{ state, dispatch }}>
      {children}
    </UserOrderContext.Provider>
  );
};

export default UserOrderContext;
