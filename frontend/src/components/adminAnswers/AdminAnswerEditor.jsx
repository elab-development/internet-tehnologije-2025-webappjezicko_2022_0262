import { useEffect, useState } from "react";
import api from "../../api";
import AdminMultipleChoice from "./AdminMultipleChoice";
import AdminTextAnswer from "./AdminTextAnswer";
import AdminMatching from "./AdminMatching";

function AdminAnswerEditor({ task }) {

  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    if (task.id) {
      fetchAnswers();
    }
  }, [task.id]);

  const fetchAnswers = async () => {
    const res = await api.get(`/api/tasks/${task.id}/answers/`);
    setAnswers(res.data);
  };

  const addAnswers = async (newAnswers) => {
    await api.post(`/api/tasks/${task.id}/answers/add/`, {
      answers: newAnswers
    });
    fetchAnswers();
  };

  const deleteAnswer = async (id) => {
    await api.delete(`/api/answers/${id}/delete`);
    fetchAnswers();
  };

  if (!task.id) {
    return <div>Save task first</div>;
  }

  const type = task.task_type_name?.toLowerCase();

  return (
    <div>

      <h3>Answer Editor</h3>

      {type === "multiple_choice" && (
        <AdminMultipleChoice
          answers={answers}
          onAdd={addAnswers}
          onDelete={deleteAnswer}
        />
      )}

      {type === "text" && (
        <AdminTextAnswer
          answers={answers}
          onAdd={addAnswers}
          onDelete={deleteAnswer}
        />
      )}

      {type === "matching" && (
        <AdminMatching
          answers={answers}
          onAdd={addAnswers}
          onDelete={deleteAnswer}
        />
      )}

    </div>
  );
}

export default AdminAnswerEditor;