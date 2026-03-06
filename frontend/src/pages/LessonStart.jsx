import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import api from "../api";
import "../styles/Lesson.css";
import "../styles/Task.css";
import {useToast} from "../components/ToastProvider.jsx";

function Start() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState({
    lesson_name : "",
    date_created : "",
    total_XP : "",
    exercise_num : ""
  });
    const [tasks, setTasks] = useState([]);
    const { addToast } = useToast();
      
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

  const fetchLesson = async () => {
      try {
        const res = await api.get(`api/user/lesson/${id}/`);
        setLesson(res.data);
      } catch (err) {
        console.error("Error fetching lessons:", err);
        addToast("error", "Failed to fetch lesson");
      }
    };

  const fetchTasks = async () => {
      try{
        const res = await api.get(`api/user/lesson/${id}/tasks/`);
        setTasks(res.data.sort((a,b) => a.sequence_number - b.sequence_number));
      } catch(err) {
        console.error("Error fetching tasks:", err);
        addToast("error", "Failed to fetch tasks");
      }
    };

    useEffect(() => {
    fetchLesson();
    fetchTasks();
  }, [id]);

 return (
    <div>
      <NavBar brand="Jezičko" links={links} onSearch={handleSearch} actions={actions} />
  
      <main>
        <h1 className="heading">Available Lessons</h1>
  
        <section className="lessons-container">
           
          {lesson && (
            <div className="lesson-details">
                    <h2>Prikaz lekcije</h2>

                    <div className="lesson-details-grid">
                    <label>Naziv:</label>
                    <input className="lesson-details-input" value={lesson.lesson_name} 
                        onChange={(e) => setLesson({ ...lesson, lesson_name: e.target.value })} 
                    />


                    <label>Total XP:</label>
                    <input className="lesson-details-input" value={lesson.total_XP} 
                        onChange={(e) => setLesson({ ...lesson, total_XP: e.target.value })} 
                    />

                    </div>
                </div>
          )}
          {tasks.map((task, idx) => (
            <div key={idx} className="task-card">
              <div className="task-grid">
              <label>Task description:</label>
              <input className="task-input" value={task.task_description}
                  onChange={(e) => {
                  const newTasks = [...tasks];
                  newTasks[idx].task_description = e.target.value;
                  setTasks(newTasks);
                  }}
                  placeholder="task desciption"/>

              <label>Sequence number:</label>
              <input className="task-input" value={task.sequence_number} readOnly/>
              
              <label>Audio:</label>  
              <select className="task-input" value={task.audio}
                    onChange={(e) => {
                      const newTasks = [...tasks];
                      newTasks[idx].audio = e.target.value === "true";
                      setTasks(newTasks);
                    }}>
                    <option value="false">False</option>
                    <option value="true">True</option>
              </select>

              <label>XP:</label>
              <input className="task-input" value={task.xp_amount}
                  onChange={(e) => {
                  const newTasks = [...tasks];
                  newTasks[idx].xp_amount = e.target.value;
                  setTasks(newTasks);
                  }}
                  placeholder="amount of XP that the task gives"/>

              </div>
            </div>
          ))}

        </section>
      </main>
    </div>
  );
}

export default Start;