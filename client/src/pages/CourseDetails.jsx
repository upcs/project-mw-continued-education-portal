import "../css/course-details.css";
import LessonNav from "../components/course-details/LessonNav";
import LessonArticle from "../components/course-details/LessonArticle";
import LessonPager from "../components/course-details/LessonPager";
import { useParams } from "react-router-dom";

export default function CourseDetails() {
  const { id } = useParams();
  
return (
    <section className="detail-page">
      <div className="detail-page__layout">
        <aside className="detail-page__side">
          <LessonNav />
        </aside>

        <main className="detail-page__main">
          <LessonArticle />
          <LessonPager />
        </main>
      </div>
    </section>
  );
}