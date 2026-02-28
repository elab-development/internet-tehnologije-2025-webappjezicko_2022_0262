import { useState } from "react";
import api from "../../api";

function MatchingForm({ taskId }) {

    const [pairs, setPairs] = useState([
        { key: "", value: "" }
    ]);

    const addPair = () => {
        setPairs([...pairs, { key: "", value: "" }]);
    };

    const updatePair = (i, field, value) => {
        const newPairs = [...pairs];
        newPairs[i][field] = value;
        setPairs(newPairs);
    };

    const save = async () => {
        await api.post(`/api/tasks/${taskId}/answers/`, {
            answers: pairs.map(p => ({
                match_key: p.key,
                match_value: p.value
            }))
        });

        alert("Sacuvano");
    };

    return (
        <div>
            <h3>Parovi</h3>

            {pairs.map((p, i) => (
                <div key={i}>
                    <input
                        placeholder="Pas"
                        value={p.key}
                        onChange={(e) =>
                            updatePair(i, "key", e.target.value)
                        }
                    />

                    <input
                        placeholder="Dog"
                        value={p.value}
                        onChange={(e) =>
                            updatePair(i, "value", e.target.value)
                        }
                    />
                </div>
            ))}

            <button onClick={addPair}>
                Dodaj par
            </button>

            <button onClick={save}>
                Sacuvaj
            </button>
        </div>
    );
}

export default MatchingForm;