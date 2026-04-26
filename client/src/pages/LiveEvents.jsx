import { useMemo, useState } from "react";
import "../css/live-events.css";
import API from "../api/api";

export default function LiveEvents() {
  const [liveLessons] = useState([]);

  const [searchSource, setSearchSource] = useState("google");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [searchError, setSearchError] = useState("");

  const hasResults = results.length > 0;

  const hasVideoSelected =
    searchSource === "youtube" &&
    selectedResult &&
    selectedResult.videoId;

  const panelTitle = useMemo(() => {
    if (!selectedResult) {
      return searchSource === "youtube"
        ? "Select a video to preview"
        : "Select a result to preview";
    }

    return selectedResult.title || "Resource Preview";
  }, [selectedResult, searchSource]);

  const resetSearchState = (source) => {
    setSearchSource(source);
    setResults([]);
    setSelectedResult(null);
    setSearchError("");
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    const query = searchQuery.trim();

    setSearchError("");
    setSelectedResult(null);

    if (!query) {
      setResults([]);
      return;
    }

    try {
      setSearching(true);

      const { data } = await API.get(
        `/resources/search?q=${encodeURIComponent(query)}&source=${encodeURIComponent(
          searchSource
        )}`
      );

      if (!data?.success) {
        throw new Error(data?.message || "Search failed");
      }

      setResults(data.data || []);
    } catch (err) {
      console.error("RESOURCE SEARCH ERROR:", err);
      setResults([]);
      setSearchError(
        err?.response?.data?.message ||
          err.message ||
          "Unable to search right now."
      );
    } finally {
      setSearching(false);
    }
  };

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

        {liveLessons.length === 0 ? (
          <div className="live-empty-card">
            <h3 className="live-empty-card__title">No upcoming lessons</h3>
            <p className="live-empty-card__text">
              Trainers will schedule live learning sessions here soon.
            </p>
          </div>
        ) : (
          <div className="live-lessons-grid">
            {liveLessons.map((lesson) => (
              <div key={lesson.id} className="live-lesson-card">
                <span className="live-lesson-card__badge">
                  {lesson.status || "Open"}
                </span>

                <h3 className="live-lesson-card__title">{lesson.title}</h3>

                {lesson.instructor && (
                  <p className="live-lesson-card__instructor">
                    {lesson.instructor}
                  </p>
                )}

                <div className="live-lesson-card__meta">
                  {lesson.date && <span>{lesson.date}</span>}
                  {lesson.time && <span>{lesson.time}</span>}
                  {lesson.duration && <span>{lesson.duration}</span>}
                </div>

                {lesson.link ? (
                  <a
                    href={lesson.link}
                    target="_blank"
                    rel="noreferrer"
                    className="live-btn live-btn--primary"
                  >
                    Join
                  </a>
                ) : (
                  <button type="button" className="live-btn live-btn--secondary">
                    View Details
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="live-block">
        <div className="resource-search-panel">
          <div className="resource-search-panel__left">
            <div className="resource-search-header">
              <h2 className="live-block__title">Online Resources</h2>

              <div className="resource-tabs">
                <button
                  type="button"
                  className={`resource-tab ${
                    searchSource === "google" ? "resource-tab--active" : ""
                  }`}
                  onClick={() => resetSearchState("google")}
                >
                  Google
                </button>

                <button
                  type="button"
                  className={`resource-tab ${
                    searchSource === "youtube" ? "resource-tab--active" : ""
                  }`}
                  onClick={() => resetSearchState("youtube")}
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

              <button
                type="submit"
                className="resource-search-form__button"
                disabled={searching}
              >
                {searching ? "Searching..." : "Search"}
              </button>
            </form>

            {searchError && (
              <p className="resource-search-error">{searchError}</p>
            )}

            <div className="resource-results">
              {searching ? (
                <p className="resource-results__state">
                  Searching {searchSource}...
                </p>
              ) : !hasResults ? (
                <p className="resource-results__state">
                  Search for Google pages or YouTube videos here.
                </p>
              ) : (
                results.map((item, index) => {
                  const key =
                    item.id ||
                    item.videoId ||
                    item.link ||
                    `${item.type || searchSource}-${index}`;

                  const isActive =
                    selectedResult &&
                    (selectedResult.link === item.link ||
                      selectedResult.id === item.id ||
                      selectedResult.videoId === item.videoId);

                  return (
                    <button
                      key={key}
                      type="button"
                      className={`resource-result-card ${
                        isActive ? "resource-result-card--active" : ""
                      }`}
                      onClick={() => setSelectedResult(item)}
                    >
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title || "Resource thumbnail"}
                          className="resource-result-card__thumb"
                        />
                      ) : (
                        <div className="resource-result-card__thumb resource-result-card__thumb--placeholder">
                          {item.type === "youtube" || searchSource === "youtube"
                            ? "▶"
                            : "↗"}
                        </div>
                      )}

                      <div className="resource-result-card__content">
                        <p className="resource-result-card__title">
                          {item.title || "Untitled resource"}
                        </p>

                        {item.type === "youtube" || searchSource === "youtube" ? (
                          <p className="resource-result-card__meta">
                            {item.channel || "YouTube"}
                            {item.duration ? ` • ${item.duration}` : ""}
                          </p>
                        ) : (
                          <p className="resource-result-card__meta">
                            {item.source || item.link || "Google result"}
                          </p>
                        )}

                        {item.snippet && (
                          <p className="resource-result-card__snippet">
                            {item.snippet}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })
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
                  title={selectedResult.title || "YouTube video preview"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="resource-preview__card">
                <p className="resource-preview__meta">
                  {selectedResult.source || selectedResult.type || "Resource"}
                </p>

                {selectedResult.snippet && (
                  <p className="resource-preview__snippet">
                    {selectedResult.snippet}
                  </p>
                )}

                {selectedResult.link && (
                  <a
                    href={selectedResult.link}
                    target="_blank"
                    rel="noreferrer"
                    className="resource-preview__link"
                  >
                    Open source
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </section>
  );
}