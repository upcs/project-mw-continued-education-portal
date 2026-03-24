import "../css/live-events.css";
import UpcomingEmpty from "../components/live/UpcomingEmpty";
import SlotHead from "../components/live/SlotHead";
import SlotGrid from "../components/live/SlotGrid";

export default function LiveEvents() {
  return (
    <section className="live-page">
      <header className="live-page__head">
        <h1 className="live-page__title">Live Lessons</h1>
      </header>

      <section className="live-block">
        <h2 className="live-block__title">Upcoming Lessons</h2>
        <UpcomingEmpty />
      </section>

      <section className="live-block">
        <h2 className="live-block__title">Schedule a lesson</h2>
        <p className="live-block__sub">
          <span className="live-block__sub-strong">Available Slots</span>
          <span className="live-block__sub-note">(N.B. time set to GMT+1)</span>
        </p>

        <div className="slot-card">
          <SlotHead />
          <SlotGrid />
        </div>
      </section>
    </section>
  );
}