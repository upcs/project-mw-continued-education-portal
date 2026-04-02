import "../css/welcome.css";
import "../css/signup.css";
import WelcomeNavbar from "../components/welcome/WelcomeNavbar";
import SignupHero from "../components/signup/SignupHero";

export default function Signup() {
  return (
    <main className="welcome-page">
      <div className="welcome-shell">
        <WelcomeNavbar actionLabel="Login" actionTo="/" />
        <SignupHero />
      </div>
    </main>
  );
}