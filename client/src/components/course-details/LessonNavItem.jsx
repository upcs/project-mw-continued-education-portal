export default function LessonNavItem({ title, icon: Icon, active = false }) {
  return (
    <button
      className={`lesson-item ${active ? "lesson-item--active" : ""}`}
      type="button"
    >
      <Icon size={16} />
      <span>{title}</span>
    </button>
  );
}