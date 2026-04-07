import { Radio, User } from "lucide-react";

export default function LiveEventsCard() {
  return (
    <article className="live-event-card">
      <div className="live-event-card__brand">MOLP</div>

      <div className="live-event-card__content">
        <p className="live-event-card__title">
          Ipsum odio et integer aliquet lorem a, sem suscipit varius.
        </p>

        <div className="live-event-card__meta">
          <User size={14} />
          <span>UP LENDO</span>
        </div>
      </div>

      <div className="live-event-card__status">
        <Radio size={20} />
        <span className="live-event-card__status-text">Live</span>
      </div>
    </article>
  );
}