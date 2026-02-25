import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import api from "../api";
import "../styles/Lesson.css"
import "../styles/NavBar.css"


function Admin() {
  const navigate = useNavigate();
  const [lesson, setLesson] = useState({
    lesson_name : "",
    date_created : "",
    total_XP : "",
    exercise_num : ""
  });
  const [lessons, setAllLessons] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchAllLessons = async () => {
      try {
        const res = await api.get("/api/adminpanel/lessons/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
          },
        });
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

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    navigate("/login");
  };

  const handleAdd = async (lesson) => {
    try {
        await api.post("/api/adminpanel/lessons/", lesson);
        fetchAllLessons();
        setShowAddForm(false); 
      } catch (err) {
        console.error("Failed to fetch lessons:", err);
      }
  };

  const handleCancel = () => {
    setShowAddForm(false);
  };

  const token = localStorage.getItem(ACCESS_TOKEN);
  const actions = token ? (
    <button onClick={handleLogout} className="navbar-btn">Logout</button>
  ) : null;

  return (
    <div>
      <NavBar brand="Jezičko" links={links} onSearch={handleSearch} actions={actions} />

      <main>
        <h1 className="heading">Welcome to Jezičko!</h1>
        {!showAddForm && (
          <section className="lessons-container">
          {lessons.map((lesson, idx) => (
            <div key={idx} className="lesson-card">
              <h3>{lesson.lesson_name}</h3>
            <button onClick={() => navigate(`/lessons/${lesson.id}`)} className="detail-button">Details</button>          
            </div>
          ))}
          <button onClick={() => setShowAddForm(true)}>DODAJ LEKCIJU</button>
        </section>
        )}
        {showAddForm && (
          <section className="lessons-container">
           
          {lesson && (
            <div className="lesson-details">
                    <h2>Dodavanje lekcije</h2>

                    <div className="lesson-details-grid">
                    <label>Naziv:</label>
                    <input className="lesson-details-input" 
                        onChange={(e) => setLesson({ ...lesson, lesson_name: e.target.value })} 
                    />

                    <label>Date:</label>
                    <input className="lesson-details-input"  
                        onChange={(e) => setLesson({ ...lesson, date_created: e.target.value })} 
                    />

                    <label>Total XP:</label>
                    <input className="lesson-details-input" 
                        onChange={(e) => setLesson({ ...lesson, total_XP: e.target.value })} 
                    />

                    <label>Num of exercises:</label>
                    <input className="lesson-details-input"  
                        onChange={(e) => setLesson({ ...lesson, exercise_num: e.target.value })} 
                    />
                    
                    <button onClick={handleCancel} className="detail-button">Otkazi</button>
                    <button onClick={() => handleAdd(lesson)} className="detail-button">Dodaj</button>
                    </div>
                </div>
          )}
        </section>
        )
        }
      </main>
    </div>
  );

}

export default Admin;