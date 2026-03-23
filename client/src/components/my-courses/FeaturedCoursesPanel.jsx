import FeaturedCourseCard from "./FeaturedCourseCard";

export default function FeaturedCoursesPanel() {
  return (
    <section className="featured-courses-panel">
      <h2 className="featured-courses-panel__title">Featured</h2>

      <div className="featured-courses-panel__list">
        <FeaturedCourseCard
          variant="light"
          subtitle="Enim erat elit diam donec"
          title="Quisque et tristique eu est sed id sapien, nullam erat."
          author="Shams Tabrez"
        />

        <FeaturedCourseCard
          variant="dark"
          subtitle="Nibh consectetur leo"
          title="A, sed lectus id rutrum phasellus adipiscing sit dolor quis."
          author="Shams Tabrez"
        />
      </div>
    </section>
  );
}