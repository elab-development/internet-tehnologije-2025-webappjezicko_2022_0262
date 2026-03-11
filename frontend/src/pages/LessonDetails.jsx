import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import api from "../api";
import { useToast } from "../components/ToastProvider.jsx";
import AdminAnswerEditor from "../components/adminAnswers/AdminAnswerEditor";
import "../styles/Admin.css"

function Details() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState({
    lesson_name: "",
    date_created: "",
    total_XP: "",
    exercise_num: ""
  });
  const [tasks, setTasks] = useState([])
  const [serverTasks, setServerTasks] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [originalTaskTypes, setOriginalTaskTypes] = useState({});
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
    if (tasks.length !== 0) {
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
        question: "",
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

    try {
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

    try {
      const originalType = originalTaskTypes[task.id];

      if (task.task_type !== originalType) {
        const res = await api.get(`api/tasks/${task.id}/answers`);

        if (res.data.length > 0) {
          addToast(
            "error",
            "You must delete existing answers before changing task type"
          );
          return;
        }
      }

      await api.patch(
        `api/adminpanel/lessons/${lesson.id}/tasks/${task.id}/change`,
        task
      );

      fetchTasks();

    } catch (err) {
      console.error("Error saving task:", err);
      addToast("error", "Failed to save task");
    }
  };

  const handleDeleteTask = async (task) => {
    try {
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
    try {
      const res = await api.get(`api/adminpanel/lessons/${id}/tasks`);
      const sortedTasks = res.data.sort((a, b) => a.sequence_number - b.sequence_number);

      setTasks(sortedTasks);
      setServerTasks(sortedTasks);

      const typeMap = {};
      sortedTasks.forEach(t => {
        typeMap[t.id] = t.task_type;
      });
      setOriginalTaskTypes(typeMap);

    } catch (err) {
      console.error("Error fetching tasks:", err);
      addToast("error", "Failed to fetch tasks");
    }
  };

  const fetchTaskTypes = async () => {
    try {
      const res = await api.get(`api/adminpanel/task-types`);
      setTaskTypes(res.data);
    } catch (err) {
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
    <div className="admin-body">
      <NavBar brand="Jezičko Admin" links={links} onSearch={handleSearch} actions={actions} />

      <main className="details-main">
        <h1 className="heading-admin">Lecture Management</h1>

        <section className="lesson-details-card">
          <h2>Lecture overview</h2>
          <div className="admin-grid">
            <label>Naziv:</label>
            <input className="admin-input" value={lesson.lesson_name}
              onChange={(e) => setLesson({ ...lesson, lesson_name: e.target.value })}
            />

            <label>Date:</label>
            <input className="admin-input" type="date" value={lesson.date_created}
              onChange={(e) => setLesson({ ...lesson, date_created: e.target.value })}
            />

            <label>Total XP:</label>
            <input className="admin-input" type="number" value={lesson.total_XP}
              onChange={(e) => setLesson({ ...lesson, total_XP: e.target.value })}
            />

            <label>Num of exercises:</label>
            <input className="admin-input" type="number" value={lesson.exercise_num}
              onChange={(e) => setLesson({ ...lesson, exercise_num: e.target.value })}
            />
          </div>

          <div className="admin-btn-row">
            <button onClick={handleUpdateLesson} className="btn-update">Change lecture</button>
            <button onClick={handleDeleteLesson} className="btn-delete">Delete lecture</button>
          </div>
        </section>

        <div className="tasks-section">
          <h2 style={{ color: '#54cc04', marginBottom: '20px' }}>Zadaci ({tasks.length}/{lesson.exercise_num})</h2>

          {tasks.map((task, idx) => (
            <div key={idx} className="task-card">
              <div className="admin-grid">
                <label>Description:</label>
                <input className="task-input" value={task.task_description}
                  onChange={(e) => {
                    const newTasks = [...tasks];
                    newTasks[idx].task_description = e.target.value;
                    setTasks(newTasks);
                  }}
                />

                <label>Question:</label>
                <input className="task-input" value={task.question}
                  onChange={(e) => {
                    const newTasks = [...tasks];
                    newTasks[idx].question = e.target.value;
                    setTasks(newTasks);
                  }}
                />

                <label>Settings & XP:</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    className="task-input"
                    style={{ flex: 1 }}
                    value={task.audio}
                    onChange={(e) => {
                      const newTasks = [...tasks];
                      newTasks[idx].audio = e.target.value === "true";
                      setTasks(newTasks);
                    }}
                  >
                    <option value="false">Audio: No</option>
                    <option value="true">Audio: Yes</option>
                  </select>

                  <select
                    className="task-input"
                    style={{ flex: 2 }}
                    value={task.task_type || ""}
                    onChange={(e) => {
                      const newTasks = [...tasks];
                      newTasks[idx].task_type = Number(e.target.value);
                      setTasks(newTasks);
                    }}
                  >
                    <option value="">Select type</option>
                    {taskTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>

                  <input
                    className="task-input"
                    style={{ flex: 1 }}
                    type="number"
                    placeholder="XP"
                    value={task.xp_amount}
                    onChange={(e) => {
                      const newTasks = [...tasks];
                      newTasks[idx].xp_amount = e.target.value;
                      setTasks(newTasks);
                    }}
                  />
                </div>
              </div>

              <div className="admin-btn-row">
                <button onClick={() => handleUpdateTask(task)} disabled={task.isNew} className="btn-update">Change</button>
                <button onClick={() => handleDeleteTask(task)} className="btn-delete">Obriši</button>

                {task.isNew && (
                  <button onClick={() => handleSaveTask(task)} className="btn-update" style={{ backgroundColor: '#fff' }}>Finish</button>
                )}
              </div>

              {task.id && (
                <div className="answer-editor-section">
                  <AdminAnswerEditor task={task} />
                </div>
              )}
            </div>
          ))}

          {!tasks.some(t => t.isNew) && (
            <button onClick={handleAddTask} className="btn-add-task">
              + ADD NEW EXERCISE
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default Details;