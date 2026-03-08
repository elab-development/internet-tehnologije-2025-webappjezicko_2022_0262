import { useState } from "react";

function AdminMultipleChoice({ answers, onAdd, onDelete }) {

  const [text, setText] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);

  const MAX_OPTIONS = 4;

  const handleSave = async () => {

    if (!text.trim()) return;

    await onAdd([
      {
        text: text,
        is_correct: isCorrect
      }
    ]);

    // reset inputa
    setText("");
    setIsCorrect(false);
  };

  const isDisabled = answers.length >= MAX_OPTIONS;

  return (
    <div>

      <h4>Existing answers</h4>

      {answers.map(a => (
        <div key={a.id}>
          {a.text} ({a.is_correct ? "✓" : "✗"})
          <button onClick={() => onDelete(a.id)}>
            Delete
          </button>
        </div>
      ))}

      <h4>Add new answer</h4>

      <input
        placeholder="Answer text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isDisabled}
      />

        <input
          type="checkbox"
          checked={isCorrect}
          onChange={(e) => setIsCorrect(e.target.checked)}
          disabled={isDisabled}
        />

      <button
        onClick={handleSave}
        disabled={isDisabled || !text.trim()}
      >
        Save
      </button>

    </div>
  );
}

export default AdminMultipleChoice;