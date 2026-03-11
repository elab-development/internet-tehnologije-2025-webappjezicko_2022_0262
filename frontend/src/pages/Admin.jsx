import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import api from "../api";
import "../styles/Admin.css"; 
import "../styles/NavBar.css";

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
    <div className="admin-body">
      <NavBar brand="Jezičko Admin" links={links} onSearch={handleSearch} actions={actions} />

      <main>
        <div className="header-section-admin">
          {!showAddForm && (
            <h1 className="heading-admin">AVAILABLE LESSONS OVERVIEW</h1>
          )}
        </div>

        {!showAddForm && (
          <>
            <section className="lessons-container-admin">
              {lessons.map((lesson, idx) => (
                <div key={idx} className="lesson-card-admin">
                  <h3>{lesson.lesson_name}</h3>
                  <button 
                    onClick={() => navigate(`/lessons/${lesson.id}`)} 
                    className="detail-button-admin"
                  >
                    MANAGE
                  </button>
                </div>
              ))}
            </section>

            <button onClick={() => setShowAddForm(true)} className="add-lecture-btn-centered">
              + ADD LECTURE
            </button>
          </>
        )}

        {showAddForm && (
          <div className="form-wrapper-admin">
            <div className="header-section-admin">
              <h1 className="heading-admin">CREATE NEW LECTURE</h1>
            </div>

            <section className="form-container-admin">
              <div className="lesson-details-grid-admin">
                <label>Lecture name:</label>
                <input
                  className="input-admin"
                  value={lesson.lesson_name}
                  onChange={(e) => setLesson({ ...lesson, lesson_name: e.target.value })}
                />

                <label>Creation date:</label>
                <input
                  className="input-admin"
                  type="date"
                  value={lesson.date_created}
                  onChange={(e) => setLesson({ ...lesson, date_created: e.target.value })}
                />

                <label>Total XP:</label>
                <input
                  className="input-admin"
                  type="number"
                  value={lesson.total_XP}
                  onChange={(e) => setLesson({ ...lesson, total_XP: e.target.value })}
                />

                <label>Number of exercises:</label>
                <input
                  className="input-admin"
                  type="number"
                  value={lesson.exercise_num}
                  onChange={(e) => setLesson({ ...lesson, exercise_num: e.target.value })}
                />
              </div>

              <div className="form-button-row-admin">
                <button onClick={handleCancel} className="cancel-btn-admin">CANCEL</button>
                <button onClick={handleAdd} className="confirm-btn-admin">CONFIRM ADD</button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;