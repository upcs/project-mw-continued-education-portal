import DiscussItem from "./DiscussItem";

const posts = [
  {
    id: 1,
    title: "3D Place solution",
    author: "Shams Tabrez",
    time: "Last comment 7h ago by Nahin",
    comments: 9,
    votes: 15,
    ring: "orange",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "what is the pcb board made of?",
    author: "Shams Tabrez",
    time: "Last comment 7h ago by Nahin",
    comments: 3,
    votes: 22,
    ring: "yellow",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "will reactjs take over the web development sector?",
    author: "Shams Tabrez",
    time: "Last comment 7h ago by Nahin",
    comments: 62,
    votes: 30,
    ring: "purple",
    img: "https://images.unsplash.com/photo-1502767089025-6572583495b0?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Soil Moisture Prediction with ML",
    author: "Shams Tabrez",
    time: "Last comment 7h ago by Nahin",
    comments: 5,
    votes: 10,
    ring: "cyan",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Deep Learning in the field of labour.",
    author: "Shams Tabrez",
    time: "Last comment 7h ago by Nahin",
    comments: 1,
    votes: 15,
    ring: "orange",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop",
  },
];

export default function DiscussList() {
  return (
    <div className="discuss-list">
      {posts.map((post) => (
        <DiscussItem key={post.id} {...post} />
      ))}
    </div>
  );
}