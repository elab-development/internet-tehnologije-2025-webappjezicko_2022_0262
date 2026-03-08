import { useState } from "react";

function AdminMatching({ answers, onAdd, onDelete }) {

  const [keyText, setKeyText] = useState("");
  const [valueText, setValueText] = useState("");

  const MAX_PAIRS = 4;

  const handleSave = async () => {

    if (!keyText.trim() || !valueText.trim()) return;

    await onAdd([
      {
        match_key: keyText,
        match_value: valueText
      }
    ]);

    // reset inputa
    setKeyText("");
    setValueText("");
  };

  const isDisabled = answers.length >= MAX_PAIRS;

  return (
    <div>

      <h4>Existing pairs</h4>

      {answers.map(a => (
        <div key={a.id}>
          {a.match_key} → {a.match_value}
          <button onClick={() => onDelete(a.id)}>
            Delete
          </button>
        </div>
      ))}

      <h4>Add new pair</h4>

      <input
        placeholder="Word"
        value={keyText}
        onChange={(e) => setKeyText(e.target.value)}
        disabled={isDisabled}
      />

      <input
        placeholder="Meaning"
        value={valueText}
        onChange={(e) => setValueText(e.target.value)}
        disabled={isDisabled}
      />

      <button
        onClick={handleSave}
        disabled={isDisabled || !keyText.trim() || !valueText.trim()}
      >
        Save
      </button>

    </div>
  );
}

export default AdminMatching;