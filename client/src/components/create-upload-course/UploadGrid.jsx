import UploadGridCard from "./UploadGridCard";

const courses = [
  {
    id: 1,
    title: "Lorem Project",
    status: "In Draft · Edited 5 min ago",
    type: "diagram",
  },
  {
    id: 2,
    title: "Ipsum prototype",
    status: "In Draft · Edited 5 min ago",
    type: "flow",
  },
];

export default function UploadGrid() {
  return (
    <section className="proto-grid">
      {courses.map((item) => (
        <UploadGridCard key={item.id} {...item} />
      ))}
    </section>
  );
}