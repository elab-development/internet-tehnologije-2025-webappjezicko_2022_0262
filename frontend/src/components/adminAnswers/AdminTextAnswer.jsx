import { useState } from "react";

function AdminTextAnswer({ answers, onAdd }) {

  const [text, setText] = useState("");

  return (
    <div>

      <h4>Correct answer</h4>

      {answers.map(a => (
        <div key={a.id}>
          {a.text}
        </div>
      ))}

      <input
        placeholder="Correct text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={() =>
        onAdd([
          {
            text: text,
            is_correct: true
          }
        ])
      }>
        Save
      </button>

    </div>
  );
}

export default AdminTextAnswer;