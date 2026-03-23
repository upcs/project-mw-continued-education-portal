function DiagramPreview() {
  return (
    <div className="proto-preview proto-preview--diagram">
      <div className="proto-preview__ring" />
      <div className="proto-preview__node proto-preview__node--center">
        Stakeholders
      </div>
      <div className="proto-preview__node proto-preview__node--top">Farmers</div>
      <div className="proto-preview__node proto-preview__node--left">Government</div>
      <div className="proto-preview__node proto-preview__node--right">
        Agricultural
      </div>
      <div className="proto-preview__node proto-preview__node--bottom">
        Supply chain
      </div>
    </div>
  );
}

function FlowPreview() {
  return (
    <div className="proto-preview proto-preview--flow">
      <div className="proto-preview__line proto-preview__line--one" />
      <div className="proto-preview__line proto-preview__line--two" />
      <div className="proto-preview__line proto-preview__line--three" />
      <div className="proto-preview__box proto-preview__box--one" />
      <div className="proto-preview__box proto-preview__box--two" />
      <div className="proto-preview__box proto-preview__box--three" />
      <div className="proto-preview__circle proto-preview__circle--one">3G</div>
      <div className="proto-preview__circle proto-preview__circle--two">2</div>
      <div className="proto-preview__circle proto-preview__circle--three" />
    </div>
  );
}

export default function UploadGridCard({ title, status, type }) {
  return (
    <article className="proto-grid-card">
      <div className="proto-grid-card__image">
        {type === "flow" ? <FlowPreview /> : <DiagramPreview />}
      </div>

      <div className="proto-grid-card__body">
        <h3 className="proto-grid-card__title">{title}</h3>
        <p className="proto-grid-card__status">{status}</p>
      </div>
    </article>
  );
}