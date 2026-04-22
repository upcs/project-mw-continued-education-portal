import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function WelcomeHero() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const loggedInUser = await login({
        email: form.email,
        password: form.password,
      });

      if (loggedInUser?.fullname) {
        localStorage.setItem("name", loggedInUser.fullname);
      }

      if (loggedInUser?.email) {
        localStorage.setItem("email", loggedInUser.email);
      }

      if (loggedInUser?.photo) {
        localStorage.setItem("photo", loggedInUser.photo);
      }

      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      const message =
        err?.response?.data?.message ||
        "Invalid email or password";

      setError(message);
    } finally {
      setSubmitting(false);
    }
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

        <button type="button" onClick={() => alert("you can learn more by using upelendo")} className="welcome-hero__button">
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
            <label className="welcome-login__label" htmlFor="email">
              Email
            </label>
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

            <label className="welcome-login__label" htmlFor="password">
              Password
            </label>
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

            {error && <p className="welcome-login__error">{error}</p>}

            <button
              type="submit"
              className="welcome-login__submit"
              disabled={submitting}
            >
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
