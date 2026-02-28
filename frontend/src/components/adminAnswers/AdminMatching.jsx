import { useState } from "react";

function AdminMatching({ answers, onAdd, onDelete }) {

  const [pairs, setPairs] = useState([]);

  const addPair = () => {
    setPairs([
      ...pairs,
      { match_key: "", match_value: "" }
    ]);
  };

  const update = (idx, field, value) => {
    const arr = [...pairs];
    arr[idx][field] = value;
    setPairs(arr);
  };

  const remove = (idx) => {
    const arr = [...pairs];
    arr.splice(idx, 1);
    setPairs(arr);
  };

  return (
    <div>

      <h4>Existing</h4>

      {answers.map(a => (
        <div key={a.id}>
          {a.match_key} → {a.match_value}
          <button onClick={() => onDelete(a.id)}>
            Delete
          </button>
        </div>
      ))}

      <h4>New</h4>

      {pairs.map((p, idx) => (
        <div key={idx}>

          <input
            placeholder="Word"
            value={p.match_key}
            onChange={(e) =>
              update(idx, "match_key", e.target.value)
            }
          />

          <input
            placeholder="Meaning"
            value={p.match_value}
            onChange={(e) =>
              update(idx, "match_value", e.target.value)
            }
          />

          <button onClick={() => remove(idx)}>
            Remove
          </button>

        </div>
      ))}

      <button onClick={addPair}>
        Add pair
      </button>

      <button onClick={() => onAdd(pairs)}>
        Save
      </button>

    </div>
  );
}

export default AdminMatching;