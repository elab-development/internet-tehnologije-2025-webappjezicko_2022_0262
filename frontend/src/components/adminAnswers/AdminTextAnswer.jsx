import { useState, useEffect } from "react";


function AdminTextAnswer({ answers, onAdd, onDelete }) {

  const [text, setText] = useState("");
  const [isButtonDisabled, setButtonDisabled] = useState();
  
  useEffect(() => {
    if (answers.length > 0) {
      setButtonDisabled(true);
    } else {
      setButtonDisabled(false);
    }
  }, [answers]);

  const handleAdd = () => {
    onAdd([
      {
        text: text,
        is_correct: true
      }
    ]);

    setText("");
  };

  const handleDelete = (id) => {
    onDelete(id);
  };


  return (
    <div>

      <h4>Correct answer</h4>

      {answers.map(a => (
        <div key={a.id}>
          {a.text}
          <button onClick={() => handleDelete(a.id)}>
            Delete
          </button>
        </div>
      ))}

      <input
        placeholder="Correct text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button disabled={isButtonDisabled} onClick={handleAdd}>
        Save
      </button>

    </div>
  );
}

export default AdminTextAnswer;