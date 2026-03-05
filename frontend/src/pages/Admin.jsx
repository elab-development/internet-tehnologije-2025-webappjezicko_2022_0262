import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import api from "../api";
import "../styles/Lesson.css"
import "../styles/NavBar.css"


function Admin() {
  const navigate = useNavigate();
  const [lesson, setLesson] = useState({
    lesson_name: "",
    date_created: "",
    total_XP: "",
    exercise_num: ""
  });
  const [lessons, setAllLessons] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchAllLessons = async () => {
    try {
      const res = await api.get("/api/adminpanel/lessons/");
      setAllLessons(res.data);
    } catch (err) {
      console.error("Failed to fetch lessons:", err);
    }
  };

  useEffect(() => {
    fetchAllLessons();
  }, []);

  // NavBar implementation
  const links = [
    { to: "/admin", label: "Lessons" },
    { to: "/profile", label: "Profile" },
  ];

  const handleSearch = (query) => {
    console.log("Searching for:", query);
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/logout/");
    } catch (err) {
      console.log(err);
    }
    navigate("/login");
  };

  const handleAdd = async () => {
    if (!lesson.lesson_name || !lesson.date_created) {
      alert("Please add lesson name and date!");
      return;
    }

    try {
      const safeLessonData = {
        lesson_name: lesson.lesson_name,
        date_created: lesson.date_created,
        total_XP: parseInt(lesson.total_XP, 10) || 0,
        exercise_num: parseInt(lesson.exercise_num, 10) || 0
      };

      await api.post("/api/adminpanel/lessons/", safeLessonData);

      fetchAllLessons();
      setShowAddForm(false);

      setLesson({ lesson_name: "", date_created: "", total_XP: "", exercise_num: "" });
    } catch (err) {
      console.error("Failed to add lesson:", err);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setLesson({ lesson_name: "", date_created: "", total_XP: "", exercise_num: "" });
  };

  const actions = (
    <button onClick={handleLogout} className="logout-btn">
      Logout
    </button>
  );

  return (
    <div>
      <NavBar brand="Jezičko" links={links} onSearch={handleSearch} actions={actions} />

      <main>
        <div className="header-section">
          {!showAddForm && (
            <h1 className="heading">AVAILABLE LESSONS OVERVIEW</h1>
          )}
        </div>

        {!showAddForm && (
          <>
            <section className="lessons-container">
              {lessons.map((lesson, idx) => (
                <div key={idx} className="lesson-card">
                  <h3>{lesson.lesson_name}</h3>
                  <button onClick={() => navigate(`/lessons/${lesson.id}`)} className="detail-button">
                    Details
                  </button>
                </div>
              ))}
            </section>

            <button onClick={() => setShowAddForm(true)} className="add-button">
              + ADD LECTURE
            </button>
          </>
        )}

        {showAddForm && (
          <>
            <div className="header-section">
              <h1 className="heading">ADD LECTURE</h1>
            </div>

            <section className="form-wrapper">
              <div className="form-container">
                <div className="lesson-details-grid">
                  <label>Lecture name:</label>
                  <input
                    className="lesson-details-input"
                    value={lesson.lesson_name}
                    onChange={(e) => setLesson({ ...lesson, lesson_name: e.target.value })}
                  />

                  <label>Creation date:</label>
                  <input
                    className="lesson-details-input"
                    type="date"
                    value={lesson.date_created}
                    onChange={(e) => setLesson({ ...lesson, date_created: e.target.value })}
                  />

                  <label>Total XP:</label>
                  <input
                    className="lesson-details-input"
                    type="number"
                    value={lesson.total_XP}
                    onChange={(e) => setLesson({ ...lesson, total_XP: e.target.value })}
                  />

                  <label>Number of exercises:</label>
                  <input
                    className="lesson-details-input"
                    type="number"
                    value={lesson.exercise_num}
                    onChange={(e) => setLesson({ ...lesson, exercise_num: e.target.value })}
                  />
                </div>

                <div className="form-button-row">
                  <button onClick={handleCancel} className="form-submit-btn">CANCEL</button>
                  <button onClick={handleAdd} className="form-submit-btn">+ ADD</button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Admin;