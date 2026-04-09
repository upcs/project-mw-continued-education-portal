import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/discussion.css";
import {
  getDiscussions,
  createDiscussion,
  getDiscussionById,
  createDiscussionReply,
} from "../api/discussions";

export default function Discussion() {
  const navigate = useNavigate();

  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingDiscussion, setLoadingDiscussion] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [newQuestion, setNewQuestion] = useState({
    title: "",
    question: "",
  });

  const [newReply, setNewReply] = useState("");

  const loadDiscussions = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await getDiscussions();

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load discussions");
      }

      setDiscussions(data.data || []);
    } catch (err) {
      console.error("LOAD DISCUSSIONS ERROR:", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to load discussions"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDiscussionDetails = async (discussionId) => {
    try {
      setLoadingDiscussion(true);
      setError("");
      setMessage("");

      const { data } = await getDiscussionById(discussionId);

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load discussion");
      }

      setSelectedDiscussion(data.data.discussion);
      setReplies(data.data.replies || []);
    } catch (err) {
      console.error("LOAD DISCUSSION DETAILS ERROR:", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to load discussion"
      );
    } finally {
      setLoadingDiscussion(false);
    }
  };

  useEffect(() => {
    loadDiscussions();
  }, []);

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();

    if (!newQuestion.title.trim() || !newQuestion.question.trim()) {
      setError("Title and question are required.");
      return;
    }

    try {
      setError("");
      setMessage("");

      const { data } = await createDiscussion({
        title: newQuestion.title,
        question: newQuestion.question,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to create discussion");
      }

      setMessage("Question posted successfully.");
      setNewQuestion({
        title: "",
        question: "",
      });

      await loadDiscussions();

      if (data.discussionId) {
        await loadDiscussionDetails(data.discussionId);
      }
    } catch (err) {
      console.error("CREATE DISCUSSION ERROR:", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to create discussion"
      );
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (!selectedDiscussion?.id) return;

    if (!newReply.trim()) {
      setError("Reply cannot be empty.");
      return;
    }

    try {
      setError("");
      setMessage("");

      const { data } = await createDiscussionReply(selectedDiscussion.id, {
        reply: newReply,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to post reply");
      }

      setMessage("Reply posted successfully.");
      setNewReply("");
      await loadDiscussionDetails(selectedDiscussion.id);
      await loadDiscussions();
    } catch (err) {
      console.error("CREATE REPLY ERROR:", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to post reply"
      );
    }
  };

  const handleProfileOpen = (email) => {
    navigate(`/profile?email=${encodeURIComponent(email)}`);
  };

  return (
    <section className="discussion-page">
      <header className="discussion-page__header">
        <div>
          <h1 className="discussion-page__title">Discussions</h1>
          <p className="discussion-page__subtitle">
            Ask questions, share answers, and learn together.
          </p>
        </div>
      </header>

      {error && <p className="discussion-page__error">{error}</p>}
      {message && <p className="discussion-page__message">{message}</p>}

      <div className="discussion-page__layout">
        <div className="discussion-page__left">
          <section className="discussion-card">
            <div className="discussion-card__header">
              <h2>Ask a Question</h2>
            </div>

            <form className="discussion-form" onSubmit={handleCreateDiscussion}>
              <input
                type="text"
                placeholder="Question title"
                value={newQuestion.title}
                onChange={(e) =>
                  setNewQuestion((prev) => ({ ...prev, title: e.target.value }))
                }
              />

              <textarea
                placeholder="Write your question..."
                value={newQuestion.question}
                onChange={(e) =>
                  setNewQuestion((prev) => ({
                    ...prev,
                    question: e.target.value,
                  }))
                }
              />

              <button type="submit">Post Question</button>
            </form>
          </section>

          <section className="discussion-card">
            <div className="discussion-card__header">
              <h2>Questions</h2>
            </div>

            {loading ? (
              <p>Loading discussions...</p>
            ) : discussions.length === 0 ? (
              <p className="discussion-empty">No questions yet.</p>
            ) : (
              <div className="discussion-list">
                {discussions.map((discussion) => (
                  <button
                    key={discussion.id}
                    type="button"
                    className={`discussion-list-item ${
                      selectedDiscussion?.id === discussion.id
                        ? "discussion-list-item--active"
                        : ""
                    }`}
                    onClick={() => loadDiscussionDetails(discussion.id)}
                  >
                    <div className="discussion-list-item__content">
                      <h3>{discussion.title}</h3>
                      <p>{discussion.question}</p>
                    </div>

                    <UserIdentity
                      fullname={discussion.fullname}
                      role={discussion.role}
                      photo={discussion.photo}
                      email={discussion.author_email}
                      onProfileOpen={handleProfileOpen}
                    />
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="discussion-page__right">
          <section className="discussion-card discussion-card--full">
            {!selectedDiscussion ? (
              <div className="discussion-empty-state">
                <h3>Select a question</h3>
                <p>Open any discussion to view answers and reply.</p>
              </div>
            ) : loadingDiscussion ? (
              <p>Loading discussion...</p>
            ) : (
              <>
                <div className="discussion-thread">
                  <h2>{selectedDiscussion.title}</h2>
                  <p className="discussion-thread__question">
                    {selectedDiscussion.question}
                  </p>

                  <UserIdentity
                    fullname={selectedDiscussion.fullname}
                    role={selectedDiscussion.role}
                    photo={selectedDiscussion.photo}
                    email={selectedDiscussion.author_email}
                    onProfileOpen={handleProfileOpen}
                  />
                </div>

                <div className="discussion-replies">
                  <h3>Answers</h3>

                  {replies.length === 0 ? (
                    <p className="discussion-empty">
                      No answers yet. Be the first to reply.
                    </p>
                  ) : (
                    replies.map((reply) => (
                      <div key={reply.id} className="discussion-reply">
                        <p className="discussion-reply__text">{reply.reply}</p>

                        <UserIdentity
                          fullname={reply.fullname}
                          role={reply.role}
                          photo={reply.photo}
                          email={reply.author_email}
                          onProfileOpen={handleProfileOpen}
                        />
                      </div>
                    ))
                  )}
                </div>

                <form className="discussion-reply-form" onSubmit={handleReplySubmit}>
                  <textarea
                    placeholder="Write your answer..."
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                  />
                  <button type="submit">Post Answer</button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}

function UserIdentity({ fullname, role, photo, email, onProfileOpen }) {
  return (
    <div className="discussion-user">
      <button
        type="button"
        className="discussion-user__photo-btn"
        onClick={() => onProfileOpen(email)}
        title="View profile"
      >
        {photo ? (
          <img src={photo} alt={fullname || email} className="discussion-user__photo" />
        ) : (
          <div className="discussion-user__photo discussion-user__photo--placeholder">
            {(fullname || email || "U").charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      <div className="discussion-user__meta">
        <button
          type="button"
          className="discussion-user__name-btn"
          onClick={() => onProfileOpen(email)}
        >
          {fullname || email}
        </button>
        <span className="discussion-user__role">{role || "user"}</span>
      </div>
    </div>
  );
}