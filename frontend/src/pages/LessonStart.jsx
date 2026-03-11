import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import api from "../api";
import "../styles/Start.css"; 
import { useToast } from "../components/ToastProvider.jsx";

const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

function Start() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [lesson, setLesson] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [userAnswer, setUserAnswer] = useState("");
  const [taskOptions, setTaskOptions] = useState([]);

  const [leftColumn, setLeftColumn] = useState([]);
  const [rightColumn, setRightColumn] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [userPairs, setUserPairs] = useState([]);

  const links = [
    { to: "/home", label: "Lessons" },
    { to: "/lessons", label: "Available Lessons" },
    { to: "/profile", label: "Profile" },
  ];

  useEffect(() => {
    if (!id || id === "undefined") return;

    const fetchInitialData = async () => {
      try {
        const lessonRes = await api.get(`api/user/lesson/${id}/`);
        setLesson(lessonRes.data);

        const tasksRes = await api.get(`api/user/lesson/${id}/tasks/`);
        const sortedTasks = tasksRes.data.sort((a, b) => a.sequence_number - b.sequence_number);
        setTasks(sortedTasks);
      } catch (err) {
        console.error("Error fetching lesson data:", err);
        addToast("error", "Failed to load lesson data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);

  useEffect(() => {
    if (tasks.length > 0) {
      const currentTask = tasks[currentIndex];
      const taskType = currentTask.task_type_name?.toLowerCase();

      const fetchTaskOptions = async () => {
        try {
          const res = await api.get(`api/tasks/${currentTask.id}/answers/`);

          if (taskType === "multiple_choice") {
            setTaskOptions(res.data);
          } else if (taskType === "matching") {
            const keys = res.data.map(opt => opt.match_key).filter(Boolean);
            const values = res.data.map(opt => opt.match_value).filter(Boolean);

            setLeftColumn(shuffleArray(keys));
            setRightColumn(shuffleArray(values));

            setUserPairs([]);
            setSelectedLeft(null);
            setSelectedRight(null);
          }
        } catch (err) {
          console.error("Failed to fetch task options:", err);
          addToast("error", "Could not load answer options.");
        }
      };

      if (taskType === "multiple_choice" || taskType === "matching") {
        fetchTaskOptions();
      } else {
        setTaskOptions([]);
      }
    }
  }, [currentIndex, tasks]);

  const handleMatchClick = (side, text) => {
    if (userPairs.some(p => p.key === text || p.value === text)) return;

    if (side === "left") {
      if (selectedLeft === text) {
        setSelectedLeft(null);
      } else {
        setSelectedLeft(text);
        if (selectedRight) {
          setUserPairs([...userPairs, { key: text, value: selectedRight }]);
          setSelectedLeft(null);
          setSelectedRight(null);
        }
      }
    } else {
      if (selectedRight === text) {
        setSelectedRight(null);
      } else {
        setSelectedRight(text);
        if (selectedLeft) {
          setUserPairs([...userPairs, { key: selectedLeft, value: text }]);
          setSelectedLeft(null);
          setSelectedRight(null);
        }
      }
    }
  };

  const handleAnswerSubmit = async (selectedId = null) => {
    const currentTask = tasks[currentIndex];
    const taskType = currentTask.task_type_name?.toLowerCase();

    let payload = {};

    if (taskType === "multiple_choice") {
      if (!selectedId) return;
      payload = { answer_id: selectedId };
    } else if (taskType === "text") {
      if (!userAnswer.trim()) {
        addToast("warning", "Please enter an answer first.");
        return;
      }
      payload = { text: userAnswer };
    } else if (taskType === "matching") {
      if (userPairs.length !== leftColumn.length) {
        addToast("warning", "Please match all pairs before submitting.");
        return;
      }
      payload = { pairs: userPairs };
    } else {
      addToast("warning", "Unsupported task type.");
      return;
    }

    try {
      const res = await api.post(`api/tasks/${currentTask.id}/submit/`, payload);

      if (res.data.correct) {
        addToast("success", `Correct! +${currentTask.xp_amount} XP.`);

        if (currentIndex + 1 < tasks.length) {
          setCurrentIndex(currentIndex + 1);
          setUserAnswer("");
        } else {
          const finishRes = await api.post(`api/lessons/${id}/finish/`);
          addToast("success", `Lesson Complete! Total XP earned: ${finishRes.data.xp}`);
          navigate("/home");
        }
      } else {
        addToast("error", "Incorrect answer. Try again!");
        if (taskType === "matching") {
          setUserPairs([]);
          setSelectedLeft(null);
          setSelectedRight(null);
        }
      }
    } catch (err) {
      console.error("Error verifying answer:", err);
      addToast("error", err.response?.data?.error || "Failed to submit answer.");
    }
  };

  const handleListen = async (task) => {
    try {
      let speech = new SpeechSynthesisUtterance();
      const res = await api.get(`api/user/lesson/task/${task.id}/answer/`);
      const answer = res.data.text;
      const question = task.question;

      let finalSentence = question;
      if (question.includes("_")) {
        finalSentence = question.replace(/_+/g, answer);
      } else {
        finalSentence = question.replace(question, answer);
      }

      speech.text = finalSentence;
      window.speechSynthesis.speak(speech);
    } catch (err) {
      console.error("Error fetching answer for audio:", err);
      addToast("error", "Failed to fetch audio.");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/logout/");
    } catch (err) {
      console.error(err);
    }
    navigate("/login");
  };

  if (loading) return <div className="start-body"><h1 className="heading" style={{ color: "white", textAlign:"center", marginTop:"50px" }}>LOADING...</h1></div>;
  if (!tasks || tasks.length === 0) {
    return (
      <div className="start-body" style={{ textAlign: "center", paddingTop: "50px" }}>
        <h1 className="heading" style={{ color: "white" }}>NO EXERCISES FOUND</h1>
        <p style={{ color: "#aaa", marginTop: "20px" }}>Check Django Admin to add tasks to this lesson.</p>
        <button onClick={() => navigate("/home")} className="check-answer-btn">Back Home</button>
      </div>
    );
  }

  const currentTask = tasks[currentIndex];
  const actions = <button onClick={handleLogout} className="navbar-btn">Logout</button>;

  return (
    <div className="start-body">
      <NavBar brand="Jezičko" links={links} actions={actions} />
      
      <main className="start-container">
        {lesson && (
          <div style={{ textAlign: "center", width: "100%" }}>
            <h1 className="heading" style={{margin: "0 auto 10px auto"}}>{lesson.lesson_name}</h1>
            <h3 style={{ color: "white", marginBottom: "30px", fontSize:"1.2rem" }}>Reward: <span style={{color:"#54cc04"}}>{lesson.total_XP} XP</span></h3>
          </div>
        )}

        <section className="exercise-card">
          <div className="exercise-header">
            <span className="exercise-number">Exercise {currentIndex + 1} of {tasks.length}</span>
            <span className="exercise-xp-badge">+{currentTask.xp_amount} XP</span>
          </div>

          <div style={{ textAlign: "center", width: "100%" }}>
            <p className="task-instruction">{currentTask.task_description}</p>
            <h2 className="task-question">{currentTask.question}</h2>

            <div className="answer-section">
              {currentTask.task_type_name?.toLowerCase() === "multiple_choice" ? (
                <div className="matching-grid">
                  {taskOptions.map((opt) => (
                    <button 
                      key={opt.id} 
                      className="match-button" 
                      onClick={() => handleAnswerSubmit(opt.id)}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>

              ) : currentTask.task_type_name?.toLowerCase() === "text" ? (
                <div style={{display:"flex", justifyContent:"center", marginBottom:"30px"}}>
                   <input 
                    className="match-button" 
                    style={{ width: "100%", maxWidth: "400px", textAlign: "center", fontSize: "1.2rem", color:"white", cursor:"text" }}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Kucaj ovde..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAnswerSubmit()}
                    autoFocus
                  />
                </div>

              ) : currentTask.task_type_name?.toLowerCase() === "matching" ? (
                <div className="matching-grid">
                  <div className="matching-column">
                    {leftColumn.map((keyText, i) => {
                      const isPaired = userPairs.some(p => p.key === keyText);
                      const isSelected = selectedLeft === keyText;
                      return (
                        <button 
                          key={`left-${i}`}
                          className={`match-button ${isSelected ? 'selected' : ''} ${isPaired ? 'paired' : ''}`}
                          onClick={() => handleMatchClick("left", keyText)}
                          disabled={isPaired}
                        >
                          {keyText}
                        </button>
                      );
                    })}
                  </div>

                  <div className="matching-column">
                    {rightColumn.map((valText, i) => {
                      const isPaired = userPairs.some(p => p.value === valText);
                      const isSelected = selectedRight === valText;
                      return (
                        <button 
                          key={`right-${i}`}
                          className={`match-button ${isSelected ? 'selected' : ''} ${isPaired ? 'paired' : ''}`}
                          onClick={() => handleMatchClick("right", valText)}
                          disabled={isPaired}
                        >
                          {valText}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "15px", marginTop:"20px"}}>
              {currentTask.audio && (
                <button 
                  onClick={() => handleListen(currentTask)} 
                  className="match-button"
                  style={{ padding: "10px 40px" }}
                >
                  🔊 Listen
                </button>
              )}
              
              {(currentTask.task_type_name?.toLowerCase() === "text" || currentTask.task_type_name?.toLowerCase() === "matching") && (
                <button onClick={() => handleAnswerSubmit()} className="check-answer-btn">
                  Check Answer
                </button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Start;