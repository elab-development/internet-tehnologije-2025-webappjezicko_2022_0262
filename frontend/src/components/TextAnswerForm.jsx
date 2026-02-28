import { useState } from "react";
import api from "../../api";

function TextAnswerForm({ taskId }) {

    const [text, setText] = useState("");

    const save = async () => {
        await api.post(`/api/tasks/${taskId}/answers/`, {
            answers: [
                {
                    text: text,
                    is_correct: true
                }
            ]
        });

        alert("Sacuvano");
    };

    return (
        <div>
            <h3>Tacan odgovor</h3>

            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <button onClick={save}>
                Sacuvaj
            </button>
        </div>
    );
}

export default TextAnswerForm;