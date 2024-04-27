import React, { useState, useEffect } from "react";
import styles from "./app.module.css";

const SpeechToText = ({ onTranscript, onClear }) => {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const speechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new speechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "pl-PL";

  recognition.onresult = (event) => {
    let newTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const result = event.results[i];
      const transcriptFragment = result[0].transcript;
      if (result.isFinal) {
        newTranscript += transcriptFragment + " ";
      }
    }
    setTranscript(prevTranscript => {
      const updatedTranscript = prevTranscript + newTranscript;
      onTranscript(updatedTranscript); // Przekazujemy zaktualizowany cały transkrypt
      return updatedTranscript; // Zwracamy zaktualizowany cały transkrypt
    });
  };
  

  const startListening = () => {
    recognition.start();
  };

  const stopListening = () => {
    recognition.stop();
  };

  const clearTranscript = () => {
    setTranscript("");
    if (listening) {
      recognition.stop();
      setListening(false);
    }
    onClear();
  };

  useEffect(() => {
    listening ? startListening() : stopListening();
    return stopListening;
  }, [listening]);

  return (
    <div>
      <p>{transcript}</p>
      <button
        className={styles.speachToText}
        onMouseDown={startListening}
        onMouseUp={stopListening}
      >
        Press & speak
      </button>
      <button className={styles.speachToText} onClick={clearTranscript}>
        Clear
      </button>
    </div>
  );
};

export default SpeechToText;
