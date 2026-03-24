import UploadHeroCard from "./UploadHeroCard";

const featuredItems = [
  {
    id: 1,
    type: "Solution",
    title: "Home Security with basic electronics",
    caption: "Home security with basic electronics",
    art: "security",
  },
  {
    id: 2,
    type: "Prototype",
    title: "Simple Rocket Building",
    caption: "Simple Rocket building for beginners",
    art: "rocket",
  },
  {
    id: 3,
    type: "Solution",
    title: "Lorem Ipsum ned ut ser gut vergesen",
    caption: "Home security with basic electronics",
    art: "security",
  },
  {
    id: 4,
    type: "Prototype",
    title: "Lorem Ipsum ned ut ser gut vergesen",
    caption: "Home security with basic electronics",
    art: "security",
  },
];

export default function UploadHero() {
  return (
    <section className="proto-hero">
      <div className="proto-hero__head">
        <h2 className="proto-hero__title">Explore Solution Prototypes</h2>
        <button type="button" className="proto-hero__link">
          see all →
        </button>
      </div>

      <div className="proto-hero__grid">
        {featuredItems.map((item) => (
          <UploadHeroCard key={item.id} {...item} />
        ))}
      </div>
    </section>
  );
}