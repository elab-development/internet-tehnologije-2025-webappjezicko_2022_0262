import React, { useState } from "react";

function ProbaTTS(){

    const [text, setText] = useState("")

    const handleClick = () => {
        let speech = new SpeechSynthesisUtterance();
        speech.text = text;
        window.speechSynthesis.speak(speech);
    };

    return(

        <div>
            <h1>Text to speech proba</h1>
            <textarea 
            placeholder="Unesite text za probu" 
            type = "text"
            value={text}
            onChange={(e) => setText(e.target.value)}></textarea>
            <div>
                <select className="row"></select>
                <button onClick={handleClick}>Listen</button>
            </div>
        </div>
    )


}

export default ProbaTTS