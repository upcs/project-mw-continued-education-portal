import "../css/discussion.css";
import DiscussSearch from "../components/discussion/DiscussSearch";
import DiscussTags from "../components/discussion/DiscussTags";
import DiscussList from "../components/discussion/DiscussList";

export default function Discussion() {
  return (
    <section className="discuss">
      <header className="discuss__head">
        <h1 className="discuss__title">Discussions</h1>
        <p className="discuss__sub">
          Discuss the OLP platform — this includes sharing feedback, asking
          questions, and more.
        </p>
      </header>

      <DiscussSearch />
      <DiscussTags />
      <DiscussList />
    </section>
  );
}