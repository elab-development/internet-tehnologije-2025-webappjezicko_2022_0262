import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import api from "../api";
import "../styles/Lesson.css"
import "../styles/NavBar.css"

function Home() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await api.get("/api/user/my-lessons/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
          },
        });
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

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    navigate("/login");
  };

  const token = localStorage.getItem(ACCESS_TOKEN);
  const actions = token ? (
    <button onClick={handleLogout} className="navbar-btn">Logout</button>
  ) : (
    <>
      <button onClick={() => navigate("/login")}>Login</button>
      <button onClick={() => navigate("/register")}>Register</button>
    </>
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