import { useState } from "react";
import api from "../../api";

function MultipleChoiceForm({ taskId }) {

    const [answers, setAnswers] = useState([
        { text: "", is_correct: false },
        { text: "", is_correct: false }
    ]);

    const addAnswer = () => {
        setAnswers([...answers, { text: "", is_correct: false }]);
    };

    const updateAnswer = (index, field, value) => {
        const newAnswers = [...answers];
        newAnswers[index][field] = value;
        setAnswers(newAnswers);
    };

    const saveAnswers = async () => {
        try {
            await api.post(`/api/tasks/${taskId}/answers/`, {
                answers: answers
            });
            alert("Sačuvano!");
        } catch (err) {
            console.error(err);
            alert("Greška pri čuvanju");
        }
    };

    return (
        <div className="multiple-choice-editor">
            <h3>Opcije odgovora</h3>

            {answers.map((a, i) => (
                <div key={i} className="admin-btn-row" style={{ alignItems: 'center', marginBottom: '10px' }}>
                    <input
                        className="task-input"
                        style={{ flex: 3 }}
                        value={a.text}
                        onChange={(e) =>
                            updateAnswer(i, "text", e.target.value)
                        }
                        placeholder="Upiši odgovor..."
                    />

                    <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', color: '#54cc04', fontWeight: 'bold', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={a.is_correct}
                            onChange={(e) =>
                                updateAnswer(i, "is_correct", e.target.checked)
                            }
                        />
                        Tačan
                    </label>
                </div>
            ))}

            <div className="admin-btn-row">
                <button 
                    onClick={addAnswer} 
                    className="btn-delete" 
                    style={{ borderColor: '#54cc04', color: '#54cc04' }}
                >
                    + Dodaj opciju
                </button>

                <button onClick={saveAnswers} className="btn-update">
                    Sačuvaj sve
                </button>
            </div>
        </div>
    );
}

export default MultipleChoiceForm;