export default function WelcomeNavbar() {
  return (
    <header className="welcome-nav">
      <div className="welcome-nav__brand">
        <img className="UP-Logo" 
        src="https://www.eduopinions.com/wp-content/uploads/2018/08/UniversityofPortland-logo-350x350.jpg" 
        alt="" />
      </div>

      <div>
        <h1> UPLENDO LEARNING PLATFORM</h1>
      </div>

      <div className="welcome-nav__actions">
        <button type="button" className="welcome-nav__signup">
          Sign Up <span>›</span>
        </button>
      </div>
    </header>
  );
}