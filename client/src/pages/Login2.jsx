import "../css/login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login2() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // temporary front-end auth
    localStorage.setItem("isAuthenticated", "true");
    navigate("/dashboard");
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

          <button type="submit" className="login-form__button">
            Login
          </button>
        </form>
      </div>
    </main>
  );
}