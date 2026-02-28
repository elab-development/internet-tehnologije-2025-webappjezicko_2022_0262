import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import api from "../api";
import "../styles/Lesson.css"
import "../styles/NavBar.css"

function Home() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await api.get("/api/user/my-lessons/");
        setLessons(res.data); 
      } catch (err) {
        console.error("Failed to fetch lessons:", err);
      }
    };

    fetchLessons();
  }, []);

  // NavBar implementation
  const links = [
    { to: "/", label: "Lessons" },
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
        <h1 className="heading">Welcome to Jezičko!</h1>

        <section className="lessons-container">
          {lessons.map((lesson, idx) => (
            <div key={idx} className="lesson-card">
              <h3>{lesson.lesson_name}</h3>
              <p>XP: {lesson.earned_XP}</p>
              
            </div>
          ))}
        </section>
      </main>
    </div>
  );

}

export default Home;