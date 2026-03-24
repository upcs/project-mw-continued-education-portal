import { ChevronLeft, Bookmark, FileQuestion } from "lucide-react";
import LessonNavItem from "./LessonNavItem";

const lessons = [
  { id: 1, title: "Basic Lorem Ipsum", icon: Bookmark },
  { id: 2, title: "PCB boards", icon: Bookmark, active: true },
  { id: 3, title: "Quiz 1", icon: FileQuestion },
  { id: 4, title: "Lorem Ipsum", icon: Bookmark },
  { id: 5, title: "Sit mi lorem", icon: Bookmark },
  { id: 6, title: "Quiz 2", icon: FileQuestion },
];

export default function LessonNav() {
  return (
    <div className="lesson-nav">
      <button className="lesson-nav__back" type="button">
        <ChevronLeft size={16} />
        <span>back</span>
      </button>

      <p className="lesson-nav__label">Lessons</p>

      <div className="lesson-nav__list">
        {lessons.map((lesson) => (
          <LessonNavItem key={lesson.id} {...lesson} />
        ))}
      </div>
    </div>
  );
}