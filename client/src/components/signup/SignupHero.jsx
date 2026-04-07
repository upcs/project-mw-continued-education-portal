import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/api";

export default function SignupHero() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    try {
      setLoading(true);

      const response = await API.get("/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Signup failed");
      }

      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="signup-hero">
      <div className="signup-hero__left">
        <h1 className="signup-hero__title">JOIN US</h1>
        <p className="signup-hero__text">
          Create your account to access courses, prototypes, live sessions, and
          the learning community in one place.
        </p>

        <Link to="/" className="signup-hero__button">
          BACK TO HOME <span>»</span>
        </Link>
      </div>

      <div className="signup-hero__right">
        <div className="signup-card">
          <h2 className="signup-card__title">Sign Up</h2>
          <p className="signup-card__subtitle">
            Create your learning platform account
          </p>

          <form className="signup-form" onSubmit={handleSubmit}>
            <label className="signup-form__label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="signup-form__input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />

            <label className="signup-form__label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="signup-form__input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />

            <label className="signup-form__label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="signup-form__input"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            {error && <p className="signup-form__message signup-form__message--error">{error}</p>}
            {success && <p className="signup-form__message signup-form__message--success">{success}</p>}

            <button
              type="submit"
              className="signup-form__submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="signup-card__footer">
            Already have an account? <Link to="/">Login</Link>
          </p>
        </div>
      </div>
    </section>
  );
}