import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import api from "../api";
import "../styles/Lesson.css"
import "../styles/NavBar.css"

function Home() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    const fetchLessonsEnrollment = async () => {
      try {
        const res = await api.get("/api/user/my-lessons/");
        setEnrollments(res.data);
      } catch (err) {
        console.error("Failed to fetch lessons:", err);
      }
    };

    fetchLessonsEnrollment();
  }, []);

  // NavBar implementation
  const links = [
    { to: "/home", label: "Lessons" },
    { to: "/lessons", label: "Available Lessons" },
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

  const actions = (
    <button onClick={handleLogout} className="navbar-btn">
      Logout
    </button>
  );

  return (
    <div>
      <NavBar brand="Jezičko" links={links} onSearch={handleSearch} actions={actions} />

      <main>
        <div className="header-section">
          <h1 className="heading">Welcome to Jezičko!</h1>
        </div>

        <section className="lessons-container">
          {enrollments.map((enrollment, idx) => (
            <div key={idx} className="lesson-card">
              <h3>{enrollment.lesson_name}</h3>
              <p style={{ fontWeight: '700', marginBottom: '15px' }}>
                XP: {enrollment.earned_XP}
              </p>
              {
              <button
                onClick={() => navigate(`/lessons/${enrollment.lesson_id}/start`)}
                className="detail-button"
                
              >
                Start!
              </button>}
            </div>
          ))}
        </section>
      </main>
    </div>
  );

}

export default Home;