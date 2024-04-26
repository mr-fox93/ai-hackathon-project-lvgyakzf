import React, { useState, useEffect } from "react";

const SpeechToText = ({ onTranscript }) => {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const speechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new speechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "pl-PL";

  const startListening = () => {
    setListening(true);
    recognition.start();
  };

  const stopListening = () => {
    setListening(false);
    recognition.stop();
  };

  recognition.onresult = (event) => {
    const current = event.resultIndex;
    const transcript = event.results[current][0].transcript;
    setTranscript(transcript);
    onTranscript(transcript);
  };

  useEffect(() => {
    listening ? startListening() : stopListening();
    return stopListening;
  }, [listening]);

  return (
    <div>
      <button onClick={() => setListening((prevState) => !prevState)}>
        {listening ? "Stop" : "Start"}
      </button>
      <p>{transcript}</p>
    </div>
  );
};

export default SpeechToText;
