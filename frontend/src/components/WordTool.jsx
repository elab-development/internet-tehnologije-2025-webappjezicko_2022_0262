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
        setError("Reč nije pronađena u rečniku.");
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
      setError("Greška prilikom poziva API-ja.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Prevod i definicija reči</h2>

      <input
        type="text"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Unesite reč na engleskom"
      />

      <button onClick={handleSearch}>Pretraži</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {translation && (
        <div>
          <h3>Prevod:</h3>
          <p>{translation}</p>
        </div>
      )}

      {definition && (
        <div>
          <h3>Definicija:</h3>
          <p>{definition.meanings[0].definitions[0].definition}</p>

          {definition.meanings[0].definitions[0].example && (
            <>
              <h4>Primer:</h4>
              <p>{definition.meanings[0].definitions[0].example}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default WordTool;