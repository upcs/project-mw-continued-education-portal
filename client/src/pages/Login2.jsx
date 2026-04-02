import "../css/login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login2() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("SUBMIT CLICKED");
    setError("");

    try {
      console.log("ABOUT TO FETCH", form);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();
      console.log("LOGIN RESPONSE: ", data);

      if (data.success === true) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("email", form.email);
        navigate("/dashboard");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Server error. Please try again.");
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h1 className="login-card__title">Login</h1>
        <p className="login-card__sub">Access your learning platform</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-form__label">Email</label>
          <input
            className="login-form__input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          <label className="login-form__label">Password</label>
          <input
            className="login-form__input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />

          {error && <p className="login-form__error">{error}</p>}

          <button type="submit" className="login-form__button">
            Login
          </button>
        </form>
      </div>
    </main>
  );
}