import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Lesson.css";
import "../styles/Task.css";
import {useToast} from "../components/ToastProvider.jsx";

function Details() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState({
    lesson_name : "",
    date_created : "",
    total_XP : "",
    exercise_num : ""
  });
  const [tasks, setTasks] = useState([])
  const { addToast } = useToast();

  // Navbar links
  const links = [
    { to: "/admin", label: "Lessons" },
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

  const handleUpdateLesson = async () => {
    try {
        await api.patch(`api/adminpanel/lessons/${lesson.id}/`, lesson);
        alert("Lekcija uspešno izmenjena!");
        navigate("/admin")
    } catch (error) {
        console.error(error);
    }
};

  const handleDeleteLesson = async () => {
    try {
        await api.delete(`api/adminpanel/lessons/${lesson.id}/`);
        alert("Lekcija obrisana!");
        navigate("/admin"); // vrati na listu
    } catch (error) {
        console.error(error);
        alert("Greška pri brisanju");
    }
};

  const handleAddTask = () => {
    setTasks(prev => [
    ...prev,
    {
        id: null,
        sequence_number: "",
        task_description: "",
        xp_amount: "",
        audio: false,
        task_type: "",
        isNew: true
    }
])
};

  const handleSaveTask = async (task) => {
    try{
        const res = await api.post(`api/adminpanel/lessons/${lesson.id}/tasks`, task);
        fetchTasks()
    } catch (err) {
        console.error("Error saving task:", err);
        addToast("error", "Failed to save task");
      } 

  };

  const handleUpdateTask = async (task) => {
    try{
        await api.patch(`api/adminpanel/lessons/${lesson.id}/tasks/${task.id}/change`, task);
        fetchTasks();
    } catch (err) {
        console.error("Error saving task:", err);
        addToast("error", "Failed to save task");
      } 
  };

  const handleDeleteTask = async (task) => {
    try{
        await api.delete(`api/adminpanel/lessons/${lesson.id}/tasks/${task.id}/change`, task);
        fetchTasks();
    } catch (err) {
        console.error("Error deleting task:", err);
        addToast("error", "Failed to delete task");
      } 
  };

  const fetchLesson = async () => {
      try {
        const res = await api.get(`api/adminpanel/lessons/${id}/`);
        setLesson(res.data);
      } catch (err) {
        console.error("Error fetching lessons:", err);
        addToast("error", "Failed to fetch lesson");
      }
    };
  
  const fetchTasks = async () => {
      try{
        const res = await api.get(`api/adminpanel/lessons/${id}/tasks`);
        setTasks(res.data);
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
                    <h2>Detalji lekcije</h2>

                    <div className="lesson-details-grid">
                    <label>Naziv:</label>
                    <input className="lesson-details-input" value={lesson.lesson_name} 
                        onChange={(e) => setLesson({ ...lesson, lesson_name: e.target.value })} 
                    />

                    <label>Date:</label>
                    <input className="lesson-details-input" value={lesson.date_created} 
                        onChange={(e) => setLesson({ ...lesson, date_created: e.target.value })} 
                    />

                    <label>Total XP:</label>
                    <input className="lesson-details-input" value={lesson.total_XP} 
                        onChange={(e) => setLesson({ ...lesson, total_XP: e.target.value })} 
                    />

                    <label>Num of exercises:</label>
                    <input className="lesson-details-input" value={lesson.exercise_num} 
                        onChange={(e) => setLesson({ ...lesson, exercise_num: e.target.value })} 
                    />
                    
                    <button onClick={handleUpdateLesson} className="detail-button">Izmeni</button>
                    <button onClick={handleDeleteLesson} className="detail-button">Obriši</button>
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
              <input className="task-input" value={task.sequence_number}
                  onChange={(e) => {
                  const newTasks = [...tasks];
                  newTasks[idx].sequence_number = e.target.value;
                  setTasks(newTasks);
                  }}
                  placeholder="task sequence number"/>

              <label>Audio:</label>
              <input className="task-input" value={task.audio}
                  onChange={(e) => {
                  const newTasks = [...tasks];
                  newTasks[idx].audio = e.target.value;
                  setTasks(newTasks);
                  }}
                  placeholder="does task contain listening audio files(true or false)"/>

              <label>Task type:</label>
              <input className="task-input" value={task.task_type}
                  onChange={(e) => {
                  const newTasks = [...tasks];
                  newTasks[idx].task_type = e.target.value;
                  setTasks(newTasks);
                  }}
                  placeholder="the type of given task"/>

              <label>XP:</label>
              <input className="task-input" value={task.xp_amount}
                  onChange={(e) => {
                  const newTasks = [...tasks];
                  newTasks[idx].xp_amount = e.target.value;
                  setTasks(newTasks);
                  }}
                  placeholder="amount of XP that the task gives"/>

              <button onClick={() => handleUpdateTask(task)} className="task-button">Izmeni</button>
              <button onClick={() => handleDeleteTask(task)} className="task-button">Obriši</button>

              {task.isNew && (
              <button onClick={() => handleSaveTask(task, idx)} className="task-button">
                Zavrsi
              </button>
              )}

              </div>
            </div>
          ))}
          <button onClick={handleAddTask}>Dodaj zadatak</button>
        </section>
      </main>
    </div>
  );
}

export default Details;