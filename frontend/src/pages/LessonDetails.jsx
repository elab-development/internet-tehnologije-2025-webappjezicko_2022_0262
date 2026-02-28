import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import api from "../api";
import "../styles/Lesson.css";
import "../styles/Task.css";
import {useToast} from "../components/ToastProvider.jsx";
import AdminAnswerEditor from "../components/adminAnswers/AdminAnswerEditor";

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
  const [taskTypes, setTaskTypes] = useState([]);
  const { addToast } = useToast();

  // Navbar links
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

  const actions = (
  <button onClick={handleLogout} className="navbar-btn">
    Logout
  </button>
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
    if(tasks.length !== 0) {
      addToast("error", "Delete All tasks first!");
      return;
    }
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
  if (tasks.length >= lesson.exercise_num) {
    addToast("error", "Maximum number of tasks reached");
    return;
  }
  const nextSequence = tasks.length + 1;

  setTasks(prev => [
    ...prev,
    {
        id: null,
        sequence_number: nextSequence,
        task_description: "",
        xp_amount: "",
        audio: true,
        task_type: "",
        isNew: true
    }
  ])
};

  const handleCancelTask = (idx) => {
  const newTasks = [...tasks];
  newTasks.splice(idx, 1);
  setTasks(newTasks);
};

  const getTotalXP = () => {
    return tasks.reduce((sum, t) => sum + Number(t.xp_amount || 0), 0);
  };



  const handleSaveTask = async (task) => {
    const totalXP = getTotalXP();
    
    if (!task.task_type) {
      addToast("error", "Select task type");
    return;
    }

    if (totalXP > lesson.total_XP) {
        addToast("error", "Total XP exceeds lesson XP");
        return;
    }

    try{
        await api.post(`api/adminpanel/lessons/${lesson.id}/tasks`, task);
        fetchTasks()
    } catch (err) {
        console.error("Error saving task:", err);
        addToast("error", "Failed to save task");
    } 
  };

  const handleUpdateTask = async (task) => {
    const totalXP = getTotalXP();

    if (totalXP > lesson.total_XP) {
        addToast("error", "Total XP exceeds lesson XP");
        return;
    }

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
        setTasks(res.data.sort((a,b) => a.sequence_number - b.sequence_number));
      } catch(err) {
        console.error("Error fetching tasks:", err);
        addToast("error", "Failed to fetch tasks");
      }
    };

  const fetchTaskTypes = async () => {
    try{
      const res = await api.get(`api/adminpanel/task-types`);
      setTaskTypes(res.data);
    }catch (err) {
      console.error("Error fetching task types:", err);
      addToast("error", "Failed to fetch task types");
    }
  };

  useEffect(() => {
    fetchLesson();
    fetchTasks();
    fetchTaskTypes();
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

              <label>Task type:</label>
              <select className="task-input" value={task.task_type || ""}
                    onChange={(e) => {
                      const newTasks = [...tasks];
                      newTasks[idx].task_type = Number(e.target.value);
                      setTasks(newTasks);
                  }}>

                  <option value="">Select type</option>
                  {taskTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
              </select>

              <label>XP:</label>
              <input className="task-input" value={task.xp_amount}
                  onChange={(e) => {
                  const newTasks = [...tasks];
                  newTasks[idx].xp_amount = e.target.value;
                  setTasks(newTasks);
                  }}
                  placeholder="amount of XP that the task gives"/>

              <button 
                onClick={() => handleUpdateTask(task)} 
                disabled={task.isNew}
                className="task-button"
              >
                Izmeni
              </button>
              <button onClick={() => handleDeleteTask(task)} className="task-button">Obriši</button>

              {task.isNew && (
              <>
              <button onClick={() => handleSaveTask(task, idx)} className="task-button">
                Zavrsi
              </button>
              <button onClick={() => handleCancelTask(idx)} className="task-button"
              style={{backgroundColor: "gray"}}>
                Otkaži
              </button>
              </>
              )}
              </div>
              {task.id && (
                <AdminAnswerEditor task={task} />
              )}
            </div>
          ))}
          {!tasks.some(t => t.isNew) && (
            <button onClick={handleAddTask}>
              Dodaj zadatak
            </button>
          )}

        </section>
      </main>
    </div>
  );
}

export default Details;