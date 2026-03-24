import "../../css/StatusOverview.css";
export default function StatusOverview() {
  const items = [
    "3/7 courses",
    "30/70 quizzes",
    "2 prototypes",
    "2 hours learning",
  ];

  return (
    <div className="status">
      {items.map((item, i) => (
        <div key={i} className="status__item">
          {item}
        </div>
      ))}
    </div>
  );
}

