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
        await api.post(`/api/tasks/${taskId}/answers/`, {
            answers: answers
        });

        alert("Sacuvano!");
    };

    return (
        <>
            <h3>Odgovori</h3>

            {answers.map((a, i) => (
                <div key={i}>
                    <input
                        value={a.text}
                        onChange={(e) =>
                            updateAnswer(i, "text", e.target.value)
                        }
                        placeholder="Odgovor"
                    />

                    <input
                        type="checkbox"
                        checked={a.is_correct}
                        onChange={(e) =>
                            updateAnswer(i, "is_correct", e.target.checked)
                        }
                    />
                    Tacan
                </div>
            ))}

            <button onClick={addAnswer}>
                Dodaj odgovor
            </button>

            <button onClick={saveAnswers}>
                Sacuvaj
            </button>
        </>
    );
}

export default MultipleChoiceForm;