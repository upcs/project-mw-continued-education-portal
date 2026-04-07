import { useMemo, useState } from "react";
import "../css/live-events.css";
import API from "../api/api";

const upcomingLessons = [
  {
    id: 1,
    title: "React State Management Workshop",
    instructor: "Dr. Sarah Ahmed",
    date: "April 2, 2026",
    time: "10:00 AM",
    duration: "60 mins",
    category: "Frontend",
    status: "Open",
  },
  {
    id: 2,
    title: "MySQL Database Design",
    instructor: "Prof. Daniel Ross",
    date: "April 4, 2026",
    time: "2:30 PM",
    duration: "75 mins",
    category: "Database",
    status: "Booked",
  },
];

export default function LiveEvents() {
  const [searchSource, setSearchSource] = useState("google");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [searchError, setSearchError] = useState("");

  const hasVideoSelected =
    searchSource === "youtube" &&
    selectedResult &&
    selectedResult.videoId;

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError("");
    setSelectedResult(null);

    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setSearching(true);

      const response = await API.get(
        `/resources/search?q=${encodeURIComponent(
          searchQuery
        )}&source=${encodeURIComponent(searchSource)}`
      );

      const data = await response.json();

      if (data.success) {
        setResults(data.data || []);
      } else {
        setSearchError("Search failed.");
      }
    } catch (err) {
      console.error(err);
      setSearchError("Unable to search right now.");
    } finally {
      setSearching(false);
    }
  };

  const panelTitle = useMemo(() => {
    if (!selectedResult) {
      return searchSource === "youtube"
        ? "Select a video to preview"
        : "Select a result to preview";
    }
    return selectedResult.title;
  }, [selectedResult, searchSource]);

  return (
    <section className="live-page">
      <header className="live-page__head">
        <h1 className="live-page__title">Live Learning Hub</h1>
        <p className="live-page__intro">
          Join live sessions and search learning resources without leaving the platform.
        </p>
      </header>

      <section className="live-block">
        <h2 className="live-block__title">Upcoming Lessons</h2>

        <div className="live-lessons-grid">
          {upcomingLessons.map((lesson) => (
            <div key={lesson.id} className="live-lesson-card">
              <span className="live-lesson-card__badge">{lesson.status}</span>
              <h3>{lesson.title}</h3>
              <p>{lesson.instructor}</p>

              <div className="live-lesson-card__meta">
                <span>{lesson.date}</span>
                <span>{lesson.time}</span>
                <span>{lesson.duration}</span>
              </div>

              <button className="live-btn">
                {lesson.status === "Booked" ? "View" : "Join"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="live-block">
        <div className="resource-search-panel">
          <div className="resource-search-panel__left">
            <div className="resource-search-header">
              <h2 className="live-block__title">Online Resources</h2>

              <div className="resource-tabs">
                <button
                  type="button"
                  className={`resource-tab ${searchSource === "google" ? "resource-tab--active" : ""}`}
                  onClick={() => {
                    setSearchSource("google");
                    setResults([]);
                    setSelectedResult(null);
                    setSearchError("");
                  }}
                >
                  Google
                </button>

                <button
                  type="button"
                  className={`resource-tab ${searchSource === "youtube" ? "resource-tab--active" : ""}`}
                  onClick={() => {
                    setSearchSource("youtube");
                    setResults([]);
                    setSelectedResult(null);
                    setSearchError("");
                  }}
                >
                  YouTube
                </button>
              </div>
            </div>

            <form className="resource-search-form" onSubmit={handleSearch}>
              <input
                type="text"
                className="resource-search-form__input"
                placeholder={`Search ${searchSource} resources...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="resource-search-form__button">
                Search
              </button>
            </form>

            {searchError && (
              <p className="resource-search-error">{searchError}</p>
            )}

            <div className="resource-results">
              {searching ? (
                <p className="resource-results__state">Searching...</p>
              ) : results.length === 0 ? (
                <p className="resource-results__state">
                  Search for Google pages or YouTube videos here.
                </p>
              ) : (
                results.map((item) => (
                  <button
                    key={`${item.type}-${item.id}-${item.link}`}
                    type="button"
                    className={`resource-result-card ${
                      selectedResult?.link === item.link
                        ? "resource-result-card--active"
                        : ""
                    }`}
                    onClick={() => setSelectedResult(item)}
                  >
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="resource-result-card__thumb"
                      />
                    ) : (
                      <div className="resource-result-card__thumb resource-result-card__thumb--placeholder">
                        {item.type === "youtube" ? "▶" : "↗"}
                      </div>
                    )}

                    <div className="resource-result-card__content">
                      <p className="resource-result-card__title">{item.title}</p>

                      {item.type === "youtube" ? (
                        <p className="resource-result-card__meta">
                          {item.channel} {item.duration ? `• ${item.duration}` : ""}
                        </p>
                      ) : (
                        <p className="resource-result-card__meta">
                          {item.source || item.link}
                        </p>
                      )}

                      {item.snippet && (
                        <p className="resource-result-card__snippet">{item.snippet}</p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="resource-search-panel__right">
            <h3 className="resource-preview__title">{panelTitle}</h3>

            {!selectedResult ? (
              <div className="resource-preview__empty">
                Select a search result to preview it here.
              </div>
            ) : hasVideoSelected ? (
              <div className="resource-preview__videoWrap">
                <iframe
                  className="resource-preview__iframe"
                  src={`https://www.youtube.com/embed/${selectedResult.videoId}`}
                  title={selectedResult.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="resource-preview__card">
                <p className="resource-preview__meta">{selectedResult.source || "Google result"}</p>
                {selectedResult.snippet && (
                  <p className="resource-preview__snippet">{selectedResult.snippet}</p>
                )}
                <a
                  href={selectedResult.link}
                  target="_blank"
                  rel="noreferrer"
                  className="resource-preview__link"
                >
                  Open source
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    </section>
  );
}