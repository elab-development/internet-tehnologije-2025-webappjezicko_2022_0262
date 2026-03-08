import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import api from "../api";
import "../styles/Lesson.css";
import "../styles/Task.css";
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

    console.log("=== SUBMITTING PAYLOAD ===");
    console.log("Task Type:", taskType);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    
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

  if (loading) return <div className="header-section"><h1 className="heading" style={{color: "white"}}>LOADING...</h1></div>;
  if (!tasks || tasks.length === 0) {
    return (
        <div className="header-section" style={{textAlign: "center", marginTop: "50px"}}>
            <h1 className="heading" style={{color: "white"}}>NO EXERCISES FOUND</h1>
            <p style={{color: "#aaa", marginTop: "20px"}}>Check Django Admin to add tasks to this lesson.</p>
            <button onClick={() => navigate("/home")} className="form-submit-btn" style={{marginTop: "20px"}}>Back Home</button>
        </div>
    );
  }

  const currentTask = tasks[currentIndex];
  const actions = <button onClick={handleLogout} className="navbar-btn">Logout</button>;

  return (
    <div>
      <NavBar brand="Jezičko" links={links} actions={actions} />
      
      <main>
        {lesson && (
          <div className="header-section" style={{ textAlign: "center", marginBottom: "30px" }}>
            <h1 className="heading" style={{ color: "#54cc04" }}>{lesson.lesson_name}</h1>
            <h3 style={{ color: "white" }}>Total Reward: {lesson.total_XP} XP</h3>
          </div>
        )}

        <section className="lessons-container" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="task-card" style={{ maxWidth: '600px', width: '100%', padding: '30px', backgroundColor: '#1a1a1a', borderRadius: '10px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              <span style={{ color: '#aaa', fontSize: '1.1rem' }}>Exercise {currentIndex + 1} of {tasks.length}</span>
              <span style={{ color: '#54cc04', fontWeight: 'bold', fontSize: '1.1rem' }}>+{currentTask.xp_amount} XP</span>
            </div>

            <div className="task-grid" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              
              <h3 style={{ marginBottom: "15px", color: "#aaa", textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.9rem" }}>
                {currentTask.task_description}
              </h3>
              
              {currentTask.question && (
                <h2 style={{ marginBottom: "30px", color: "white", fontSize: "1.8rem" }}>
                  {currentTask.question}
                </h2>
              )}

              <div className="answer-section" style={{ width: "100%", marginBottom: "30px" }}>
                
                {currentTask.task_type_name?.toLowerCase() === "multiple_choice" ? (
                  <div style={{ display: "grid", gap: "15px", gridTemplateColumns: "1fr 1fr", width: "100%" }}>
                    {taskOptions.length > 0 ? (
                      taskOptions.map((opt) => (
                        <button 
                          key={opt.id} 
                          className="form-submit-btn" 
                          onClick={() => handleAnswerSubmit(opt.id)}
                          style={{ padding: "15px", fontSize: "1.1rem" }}
                        >
                          {opt.text}
                        </button>
                      ))
                    ) : (
                      <p style={{ color: "#54cc04" }}>Loading options...</p>
                    )}
                  </div>
                
                ) : currentTask.task_type_name?.toLowerCase() === "text" ? (
                  <input 
                    className="lesson-details-input" 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAnswerSubmit()}
                    autoFocus
                    style={{ width: "100%", padding: "15px", fontSize: "1.1rem", textAlign: "center" }}
                  />
                
                ) : currentTask.task_type_name?.toLowerCase() === "matching" ? (
                  <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", width: "100%" }}>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        {leftColumn.map((keyText, i) => {
                          const isPaired = userPairs.some(p => p.key === keyText);
                          const isSelected = selectedLeft === keyText;
                          return (
                            <button 
                              key={`left-${i}`}
                              onClick={() => handleMatchClick("left", keyText)}
                              disabled={isPaired}
                              style={{
                                padding: "15px", fontSize: "1.1rem", borderRadius: "8px",
                                border: isSelected ? "2px solid #fff" : "2px solid #54cc04",
                                backgroundColor: isPaired ? "#333" : isSelected ? "#54cc04" : "transparent",
                                color: isPaired ? "#666" : isSelected ? "#000" : "#54cc04",
                                cursor: isPaired ? "default" : "pointer", transition: "all 0.2s"
                              }}
                            >
                              {keyText}
                            </button>
                          );
                        })}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        {rightColumn.map((valText, i) => {
                          const isPaired = userPairs.some(p => p.value === valText);
                          const isSelected = selectedRight === valText;
                          return (
                            <button 
                              key={`right-${i}`}
                              onClick={() => handleMatchClick("right", valText)}
                              disabled={isPaired}
                              style={{
                                padding: "15px", fontSize: "1.1rem", borderRadius: "8px",
                                border: isSelected ? "2px solid #fff" : "2px solid #54cc04",
                                backgroundColor: isPaired ? "#333" : isSelected ? "#54cc04" : "transparent",
                                color: isPaired ? "#666" : isSelected ? "#000" : "#54cc04",
                                cursor: isPaired ? "default" : "pointer", transition: "all 0.2s"
                              }}
                            >
                              {valText}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "red" }}>Unknown task type: {currentTask.task_type_name}</p>
                )}
              </div>

              {currentTask.audio && (
                <button 
                  onClick={() => handleListen(currentTask)} 
                  className="form-submit-btn" 
                  style={{ width: "100%", maxWidth: "300px", marginBottom: "15px", backgroundColor: "transparent", border: "2px solid #54cc04", color: "white" }}
                >
                  🔊 Listen
                </button>
              )}

              {(currentTask.task_type_name?.toLowerCase() === "text" || currentTask.task_type_name?.toLowerCase() === "matching") && (
                <button 
                  onClick={() => handleAnswerSubmit()} 
                  className="form-submit-btn" 
                  style={{ width: "100%", maxWidth: "300px", padding: "15px", fontSize: "1.1rem" }}
                >
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