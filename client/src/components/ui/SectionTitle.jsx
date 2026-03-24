export default function SectionTitle({ title, right }) {
  return (
    <div className="section-head">
      <h2 className="section-head__title">{title}</h2>
      {right && <div>{right}</div>}
    </div>
  );
}