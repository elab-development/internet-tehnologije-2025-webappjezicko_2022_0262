import { useState } from "react";

function AdminMultipleChoice({ answers, onAdd, onDelete }) {

  const [options, setOptions] = useState([]);

  const addOption = () => {
    setOptions([
      ...options,
      { text: "", is_correct: false }
    ]);
  };

  const update = (idx, field, value) => {
    const arr = [...options];
    arr[idx][field] = value;
    setOptions(arr);
  };

  const remove = (idx) => {
    const arr = [...options];
    arr.splice(idx, 1);
    setOptions(arr);
  };

  return (
    <div>

      <h4>Existing</h4>
      {answers.map(a => (
        <div key={a.id}>
          {a.text} ({a.is_correct ? "✓" : "✗"})
          <button onClick={() => onDelete(a.id)}>
            Delete
          </button>
        </div>
      ))}

      <h4>New</h4>

      {options.map((o, idx) => (
        <div key={idx}>

          <input
            placeholder="Text"
            value={o.text}
            onChange={(e) =>
              update(idx, "text", e.target.value)
            }
          />

          <input
            type="checkbox"
            checked={o.is_correct}
            onChange={(e) =>
              update(idx, "is_correct", e.target.checked)
            }
          />

          <button onClick={() => remove(idx)}>
            Remove
          </button>

        </div>
      ))}

      <button onClick={addOption}>
        Add option
      </button>

      <button onClick={() => onAdd(options)}>
        Save
      </button>

    </div>
  );
}

export default AdminMultipleChoice;