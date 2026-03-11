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

    const removePair = (i) => {
        const newPairs = [...pairs];
        newPairs.splice(i, 1);
        setPairs(newPairs);
    };

    const save = async () => {
        try {
            await api.post(`/api/tasks/${taskId}/answers/`, {
                answers: pairs.map(p => ({
                    match_key: p.key,
                    match_value: p.value
                }))
            });
            alert("Sačuvano!");
        } catch (err) {
            console.error(err);
            alert("Greška pri čuvanju parova");
        }
    };

    return (
        <div className="matching-editor">
            <h3>Povezivanje parova</h3>

            {pairs.map((p, i) => (
                <div key={i} className="admin-btn-row" style={{ alignItems: 'center', marginBottom: '15px', gap: '10px' }}>
                    <input
                        className="task-input"
                        style={{ flex: 1 }}
                        placeholder="Reč (npr. Pas)"
                        value={p.key}
                        onChange={(e) => updatePair(i, "key", e.target.value)}
                    />
                    
                    <span style={{ color: '#54cc04', fontWeight: 'bold' }}>➜</span>

                    <input
                        className="task-input"
                        style={{ flex: 1 }}
                        placeholder="Prevod (npr. Dog)"
                        value={p.value}
                        onChange={(e) => updatePair(i, "value", e.target.value)}
                    />

                    {pairs.length > 1 && (
                        <button 
                            onClick={() => removePair(i)} 
                            className="btn-delete" 
                            style={{ padding: '8px 12px', minWidth: 'auto', border: 'none' }}
                        >
                            ✕
                        </button>
                    )}
                </div>
            ))}

            <div className="admin-btn-row">
                <button 
                    onClick={addPair} 
                    className="btn-delete" 
                    style={{ borderColor: '#54cc04', color: '#54cc04' }}
                >
                    + Dodaj par
                </button>

                <button onClick={save} className="btn-update">
                    Sačuvaj parove
                </button>
            </div>
        </div>
    );
}

export default MatchingForm;