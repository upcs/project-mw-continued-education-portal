import { Avatar, AvatarFallback, AvatarImage } from "../ui/AvatarMock";

const activities = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    heading: "Felix has replied on",
    title: "At aliquam enim in cras arcu",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labo...",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
    heading: "Ludwig has invited you to",
    title: "Imperdiet enim est, varius faucibus.",
    description: "25th Sep.   •   11.00 am",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1502767089025-6572583495b0?q=80&w=200&auto=format&fit=crop",
    heading: "Jonathon has commented on",
    title: "Venenatis aliquam sit pellentesque...",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labo...",
  },
];

export default function ActivityFeed() {
  return (
    <div className="activity-feed">
      {activities.map((item) => (
        <article className="activity-feed__item" key={item.id}>
          <div className="activity-feed__line" />

          <Avatar className="activity-feed__avatar">
            <AvatarImage src={item.image} alt={item.heading} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>

          <div className="activity-feed__body">
            <p className="activity-feed__heading">{item.heading}</p>
            <p className="activity-feed__title">{item.title}</p>
            <p className="activity-feed__description">{item.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}