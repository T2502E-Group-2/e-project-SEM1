import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import "./index.css"; // Hoặc đường dẫn đến file CSS gốc của bạn

// Lấy Client ID từ PayPal Developer Dashboard của bạn
const initialOptions = {
  clientId:
    "AT4E9IB2vgxdsijJPafKedX-ouYG_io2swXTVM-ssc5Cm4X7YKgN9pkpbRUlznDaG6kNg6BFpstxdXyO",
  currency: "USD",
  intent: "capture",
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <PayPalScriptProvider options={initialOptions}>
        <App />
      </PayPalScriptProvider>
    </BrowserRouter>
  </React.StrictMode>
);
