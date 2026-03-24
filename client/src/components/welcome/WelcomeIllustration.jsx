export default function WelcomeIllustration() {
  return (
    <div className="welcome-illustration">
      <div className="welcome-illustration__glow" />

      <div className="welcome-illustration__laptop">
        <div className="welcome-illustration__screen" />
        <div className="welcome-illustration__base" />
      </div>

      <div className="welcome-illustration__clock">
        <div className="welcome-illustration__clock-face">
          <div className="welcome-illustration__clock-hand welcome-illustration__clock-hand--hour" />
          <div className="welcome-illustration__clock-hand welcome-illustration__clock-hand--minute" />
        </div>
        <div className="welcome-illustration__bell welcome-illustration__bell--left" />
        <div className="welcome-illustration__bell welcome-illustration__bell--right" />
      </div>

      <div className="welcome-illustration__paper-plane welcome-illustration__paper-plane--one" />
      <div className="welcome-illustration__paper-plane welcome-illustration__paper-plane--two" />
      <div className="welcome-illustration__doodle welcome-illustration__doodle--one" />
      <div className="welcome-illustration__doodle welcome-illustration__doodle--two" />
      <div className="welcome-illustration__doodle welcome-illustration__doodle--three" />
    </div>
  );
}