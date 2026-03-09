import { useState } from "react";

function WordTool() {
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState(null);
  const [translation, setTranslation] = useState("");
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setError("");
    setDefinition(null);
    setTranslation("");

    try {

      const dictResponse = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      const dictData = await dictResponse.json();

      if (dictResponse.ok) {
        setDefinition(dictData[0]);
      } else {
        setError("Word not found in dictionary.");
      }


      const translateResponse = await fetch(
        "https://libretranslate.de/translate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            q: word,
            source: "en",
            target: "sr",
            format: "text",
          }),
        }
      );

      const translateData = await translateResponse.json();
      setTranslation(translateData.translatedText);
    } catch (err) {
      setError("Error while making API request.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Translation and word definition</h2>

      <input
        type="text"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Insert word in English."
      />

      <button onClick={handleSearch}>Find</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {translation && (
        <div>
          <h3>Translation: </h3>
          <p>{translation}</p>
        </div>
      )}

      {definition && (
        <div>
          <h3>Definition: </h3>
          <p>{definition.meanings[0].definitions[0].definition}</p>

          {definition.meanings[0].definitions[0].example && (
            <>
              <h4>Example: </h4>
              <p>{definition.meanings[0].definitions[0].example}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default WordTool;