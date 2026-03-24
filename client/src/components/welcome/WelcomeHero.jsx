import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function WelcomeHero() {
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

    localStorage.setItem("isAuthenticated", "true");
    navigate("/dashboard");
  };

  return (
    <section className="welcome-hero" id="home">
      <div className="welcome-hero__content">

        <h1 className="welcome-hero__title">
          WELCOME
          <br />
          
        </h1>

        <p className="welcome-hero__text">
          Learn smarter, stay connected, and manage your courses, prototypes,
          live sessions, and community in one place.
        </p>

        <button type="button" className="welcome-hero__button">
          LEARN MORE <span>»</span>
        </button>
      </div>

      <div className="welcome-hero__visual">
        <div className="welcome-login">
          <h2 className="welcome-login__title">Login</h2>
          <p className="welcome-login__sub">
            Access your learning platform
          </p>

          <form className="welcome-login__form" onSubmit={handleSubmit}>
            <label className="welcome-login__label" htmlFor="email">Email</label>
            <input
              id="email"
              className="welcome-login__input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />

            <label className="welcome-login__label" htmlFor="password">Password</label>
            <input
              id="password"
              className="welcome-login__input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

            <button type="submit" className="welcome-login__submit">
              Login
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}