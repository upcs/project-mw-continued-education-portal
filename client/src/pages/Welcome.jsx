import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/welcome.css";
import WelcomeNavbar from "../components/welcome/WelcomeNavbar";
import WelcomeHero from "../components/welcome/WelcomeHero";
import { useAuth } from "../context/AuthContext";

export default function Welcome() {
  const navigate = useNavigate();
  const { isAuthenticated, authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  return (
    <main className="welcome-page">
      <div className="welcome-shell">
        <WelcomeNavbar />
        <WelcomeHero />
      </div>
    </main>
  );
}
