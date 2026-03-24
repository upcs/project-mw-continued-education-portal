export default function DiscussItem({
  title,
  author,
  time,
  comments,
  votes,
  ring,
  img,
}) {
  return (
    <article className="discuss-item">
      <div className={`discuss-item__avatar discuss-item__avatar--${ring}`}>
        <img className="discuss-item__img" src={img} alt={title} />
      </div>

      <div className="discuss-item__body">
        <h3 className="discuss-item__title">{title}</h3>
        <p className="discuss-item__meta">
          {author} · {time}
        </p>
      </div>

      <div className="discuss-item__side">
        <div className="discuss-item__vote">⌃ {votes}</div>
        <div className="discuss-item__comments">{comments} comments</div>
      </div>
    </article>
  );
}