import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SlotHead() {
  return (
    <div className="slot-head">
      <h3 className="slot-head__title">Aug 14 - 20, 2023</h3>

      <div className="slot-head__actions">
        <span className="slot-head__today">TODAY</span>
        <button className="slot-head__btn" type="button" aria-label="Previous week">
          <ChevronLeft size={28} />
        </button>
        <button className="slot-head__btn" type="button" aria-label="Next week">
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
}