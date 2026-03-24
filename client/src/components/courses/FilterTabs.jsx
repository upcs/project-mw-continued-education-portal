const tabs = ["All", "Lorem Ipsum", "Lorem", "Ipsum", "Hala de"];

export default function FilterTabs() {
  return (
    <div className="course-filter">
      {tabs.map((tab, index) => (
        <button
          key={index}
          className={`course-filter__item ${
            index === 0 ? "course-filter__item--active" : ""
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}