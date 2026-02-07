import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Lesson.css";
import {useToast} from "../components/ToastProvider.jsx";

function Lessons() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const { addToast } = useToast();

  // Navbar links
  const links = [
    { to: "/", label: "Lessons" },
    { to: "/lessons", label: "Available Lessons" },
    { to: "/profile", label: "Profile" },
  ];

  const handleSearch = (query) => {
    console.log("Searching for:", query);
  };

  const token = localStorage.getItem(ACCESS_TOKEN);
  const actions = token ? (
    <button onClick={() => {
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      navigate("/login");
    }} className="navbar-btn">Logout</button>
  ) : (
    <>
      <button onClick={() => navigate("/login")}>Login</button>
      <button onClick={() => navigate("/register")}>Register</button>
    </>
  );

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await api.get("/api/user/lessons/");
        setLessons(res.data);
      } catch (err) {
        console.error("Error fetching lessons:", err);
        addToast("error", "Failed to fetch lessons");
      }
    };

    const fetchEnrolled = async () => {
      try {
        const res = await api.get("/api/user/my-lessons/");
        setEnrolledIds(res.data.map((lesson) => lesson.id));
      } catch (err) {
        console.error("Error fetching enrolled lessons:", err);
      }
    };

    fetchLessons();
    fetchEnrolled();
  }, []);

  const handleEnroll = async (id) => {
    try {
      await api.post("/api/user/new-enrollement/", { id });
      setEnrolledIds((prev) => [...prev, id]);
      addToast("success", "Enrolled successfully!")
    } catch (err) {
      console.error(err);
      addToast("error", err.response?.data?.detail || "Enrollment failed"); 
    }
  };

  return (
    <div>
      <NavBar brand="Jezičko" links={links} onSearch={handleSearch} actions={actions} />
  
      <main>
        <h1 className="heading">Available Lessons</h1>
  
        <section className="lessons-container">
          {lessons.length === 0 && <p>No lessons available.</p>}
  
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="lesson-card"
            >
              <h3>{lesson.lesson_name}</h3>
              <p>Start: {lesson.date_created}</p>
              <p>XP: {lesson.total_XP}</p>
              <button
                onClick={() => handleEnroll(lesson.id)}
                disabled={enrolledIds.includes(lesson.id)}
                className="enroll-button"
              >
                {enrolledIds.includes(lesson.id) ? "Enrolled" : "Enroll"}
              </button>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default Lessons;
