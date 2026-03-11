import { useState } from "react";
import api from "../../api";

function TextAnswerForm({ taskId }) {

    const [text, setText] = useState("");

    const save = async () => {
        try {
            await api.post(`/api/tasks/${taskId}/answers/`, {
                answers: [
                    {
                        text: text,
                        is_correct: true
                    }
                ]
            });
            alert("Sačuvano!");
        } catch (err) {
            console.error(err);
            alert("Greška pri čuvanju odgovora");
        }
    };

    return (
        <div className="text-answer-editor">
            <h3>Tačan odgovor</h3>

            <div className="admin-grid" style={{ gridTemplateColumns: '1fr' }}>
                <input
                    className="task-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Upiši rešenje ovde..."
                />
            </div>

            <div className="admin-btn-row">
                <button onClick={save} className="btn-update">
                    Sačuvaj odgovor
                </button>
            </div>
        </div>
    );
}

export default TextAnswerForm;