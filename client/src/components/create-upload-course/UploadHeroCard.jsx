function SecurityArt() {
  return (
    <div className="proto-art proto-art--security">
      <div className="proto-art__scene">
        <div className="proto-art__house" />
        <div className="proto-art__lens" />
        <div className="proto-art__handle" />
        <div className="proto-art__tree proto-art__tree--one" />
        <div className="proto-art__tree proto-art__tree--two" />
        <div className="proto-art__person" />
      </div>
    </div>
  );
}

function RocketArt() {
  return (
    <div className="proto-art proto-art--rocket">
      <div className="proto-art__rocket-stage">
        <div className="proto-art__steps">
          <span className="proto-art__step">1</span>
          <span className="proto-art__step">2</span>
          <span className="proto-art__step">3</span>
          <span className="proto-art__step">4</span>
          <span className="proto-art__step">5</span>
        </div>
        <div className="proto-art__character" />
      </div>
    </div>
  );
}

export default function UploadHeroCard({ type, title, caption, art }) {
  return (
    <article className="proto-hero-card">
      <div className="proto-hero-card__visual">
        <div className="proto-hero-card__badge-row">
          <span className="proto-hero-card__badge">{type}</span>
          <span className="proto-hero-card__idea">💡</span>
        </div>

        <h3 className="proto-hero-card__title">{title}</h3>

        {art === "rocket" ? <RocketArt /> : <SecurityArt />}
      </div>

      <p className="proto-hero-card__caption">{caption}</p>
    </article>
  );
}