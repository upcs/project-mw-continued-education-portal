import { ChevronLeft, ChevronRight } from "lucide-react";

export default function LessonPager() {
  return (
    <div className="lesson-pager">
      <button className="lesson-pager__btn" type="button">
        <ChevronLeft size={16} />
        <span>PREVIOUS</span>
      </button>

      <button className="lesson-pager__btn" type="button">
        <span>NEXT</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
