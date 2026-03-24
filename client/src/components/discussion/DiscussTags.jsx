const tags = ["Machine Learning", "IoT", "UI/UX", "algorithm", "Biology", "more"];

export default function DiscussTags() {
  return (
    <div className="discuss-tags">
      {tags.map((tag) => (
        <button
          key={tag}
          className={`discuss-tags__item ${
            tag === "more" ? "discuss-tags__item--more" : ""
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}