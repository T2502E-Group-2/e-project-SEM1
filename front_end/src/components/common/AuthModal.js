import { useState } from "react";

export default function AuthModal({ show, onClose }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
  });

  if (!show) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    let url = "";
    if (mode === "login") {
      url = "URL.LOGIN";
    } else {
      url = "URL.REGISTER";
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    alert(data.message);
    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user || {}));
      onClose();
      window.location.reload();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <span className="close-btn" onClick={onClose}>
          ×
        </span>
        <h2>{mode === "login" ? "Login" : "Register"}</h2>

        {mode === "register" && (
          <>
            <input
              name="first_name"
              placeholder="First Name"
              onChange={handleChange}
            />
            <input
              name="last_name"
              placeholder="Last Name"
              onChange={handleChange}
            />
            <input
              name="phone_number"
              placeholder="Phone Number"
              onChange={handleChange}
            />
          </>
        )}
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <button onClick={handleSubmit}>
          {mode === "login" ? "Login" : "Register"}
        </button>

        <p>
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <span className="link" onClick={() => setMode("register")}>
                Register
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span className="link" onClick={() => setMode("login")}>
                Login
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
