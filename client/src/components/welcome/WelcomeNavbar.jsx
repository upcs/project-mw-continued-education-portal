import { Link } from "react-router-dom";

export default function WelcomeNavbar({
  actionLabel = "Sign Up",
  actionTo = "/signup",
}) {
  return (
    <header className="welcome-nav">
      <div className="welcome-nav__brand">
        <img
          className="UP-Logo"
          src="https://www.eduopinions.com/wp-content/uploads/2018/08/UniversityofPortland-logo-350x350.jpg"
          alt="University of Portland Logo"
        />
      </div>

      <div>
        <h1>UPLENDO LEARNING PLATFORM</h1>
      </div>

      <div className="welcome-nav__actions">
        <Link to={actionTo} className="welcome-nav__signup">
          {actionLabel} <span>›</span>
        </Link>
      </div>
    </header>
  );
}