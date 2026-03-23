import "../css/my-courses.css";
import { useNavigate } from "react-router-dom";


export default function MyCourses() {
  const navigate = useNavigate();
  return (
    <section className="courses-page">
      <h1 className="courses-page__title">My Courses</h1>

      <div className="courses-page__layout">
        <div className="courses-page__main">
          <section className="courses-block">
            <h2 className="courses-block__title">Progress</h2>
            <div className="progress-box">
              <div className="progress-box__sky" />
              <div className="progress-box__ground" />
              <div className="progress-box__tree progress-box__tree--one" />
              <div className="progress-box__tree progress-box__tree--two" />
              <div className="progress-box__tree progress-box__tree--three" />
              <div className="progress-box__line" />
              <div className="progress-box__runner" />
              <div className="progress-box__tag">30%</div>
              <div className="progress-box__cup">1</div>
              <div className="progress-box__level">Beginner</div>
            </div>
          </section>

          <section className="courses-block">
            <h2 className="courses-block__title">All Status</h2>
            <div className="status-box">
              <div className="status-box__item">3/7 courses</div>
              <div className="status-box__item">30/70 quizzes</div>
              <div className="status-box__item">2 prototypes</div>
              <div className="status-box__item">2 hours learning</div>
            </div>
          </section>

          <section className="courses-block">
            <div className="courses-block__head">
              <h2 className="courses-block__title">Enrolled Courses</h2>
              <button className="catalog-btn" onClick={() => navigate("/catalog")}>COURSE CATALOG</button>
            </div>

            <div className="enroll-list">
              <div className="enroll-row">
                <div className="enroll-row__icon enroll-row__icon--violet" />
                <div className="enroll-row__body">
                  <div className="enroll-row__title">Basic of English Language</div>
                  <div className="enroll-row__label">Progress</div>
                  <div className="enroll-row__track">
                    <div className="enroll-row__fill enroll-row__fill--30" />
                  </div>
                </div>
                <div className="enroll-row__meta">
                  <span className="enroll-pill">2/10</span>
                  <span className="enroll-pill enroll-pill--muted">3/5</span>
                </div>
                <div className="enroll-row__more">•••</div>
              </div>

              <div className="enroll-row">
                <div className="enroll-row__icon enroll-row__icon--blue" />
                <div className="enroll-row__body">
                  <div className="enroll-row__title">Introduction the web development</div>
                  <div className="enroll-row__label">Progress</div>
                  <div className="enroll-row__track">
                    <div className="enroll-row__fill enroll-row__fill--5" />
                  </div>
                </div>
                <div className="enroll-row__meta">
                  <span className="enroll-pill">0/10</span>
                  <span className="enroll-pill enroll-pill--muted">0/0</span>
                </div>
                <div className="enroll-row__more">•••</div>
              </div>

              <div className="enroll-row">
                <div className="enroll-row__icon enroll-row__icon--violet" />
                <div className="enroll-row__body">
                  <div className="enroll-row__title">Basic data-structure and algorithm</div>
                  <div className="enroll-badge">Completed</div>
                </div>
                <div className="enroll-row__meta">
                  <span className="cert-btn">View Certificate</span>
                </div>
                <div className="enroll-row__more">•••</div>
              </div>

              <div className="enroll-row">
                <div className="enroll-row__icon enroll-row__icon--blue" />
                <div className="enroll-row__body">
                  <div className="enroll-row__title">Lorem ipsum codor le hala madrid</div>
                  <span className="cert-btn">View Certificate</span>
                </div>
                <div className="enroll-row__meta">
                  <span className="enroll-badge">Completed</span>
                </div>
                <div className="enroll-row__more">•••</div>
              </div>
            </div>
          </section>
        </div>

        <aside className="courses-page__side">
          <div className="calendar-box">
            <div className="calendar-box__title">Sept 2023</div>
            <div className="calendar-box__days">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
            <div className="calendar-box__dates">
              <span>26</span><span>27</span><span>28</span><span>29</span><span className="is-active">30</span><span>01</span><span className="is-outline">02</span>
            </div>
          </div>

          <div className="side-card">
            <div className="side-card__head">
              <div className="side-card__icon" />
              <div>
                <div className="side-card__title">Due Date</div>
                <div className="side-card__date">Oct 02, 2022</div>
              </div>
            </div>
            <div className="side-card__label">Assignment 04</div>
            <div className="side-card__text">
              Nisi, venenatis id cursus volutpat cursus interdum enim mauris.
            </div>
          </div>

          <div className="featured">
            <h2 className="featured__title">Featured</h2>

            <div className="feature-card feature-card--light">
              <div className="feature-card__top">
                <div className="feature-card__icon" />
                <div className="feature-card__meta">5 lessons ・ 4 quizes</div>
              </div>
              <div className="feature-card__sub">Enim erat elit diam donec</div>
              <div className="feature-card__text">
                Quisque et tristique eu est sed id sapien, nullam erat.
              </div>
              <div className="feature-card__author">Shams Tabrez</div>
            </div>

            <div className="feature-card feature-card--dark">
              <div className="feature-card__top">
                <div className="feature-card__icon" />
                <div className="feature-card__meta">5 lessons ・ 4 quizes</div>
              </div>
              <div className="feature-card__sub">Nibh consectetur leo</div>
              <div className="feature-card__text">
                A, sed lectus id rutrum phasellus adipiscing sit dolor quis.
              </div>
              <div className="feature-card__author">Shams Tabrez</div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}