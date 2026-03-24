import "../css/welcome.css";
import WelcomeNavbar from "../components/welcome/WelcomeNavbar";
import WelcomeHero from "../components/welcome/WelcomeHero";

export default function Welcome() {
  return (
    <main className="welcome-page">
      <div className="welcome-shell">
        <WelcomeNavbar />
        <WelcomeHero />
      </div>
    </main>
  );
}