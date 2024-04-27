import React, { useState, useEffect } from "react";

const SpeechToText = ({ onTranscript, onClear }) => {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new speechRecognition();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "pl-PL";

  recognition.onresult = (event) => {
    const current = event.resultIndex;
    const transcript = event.results[current][0].transcript;
    onTranscript(transcript);
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

  recognition.onresult = (event) => {
    let newTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const result = event.results[i];
      const transcriptFragment = result[0].transcript;
      if (result.isFinal) {
        newTranscript += transcriptFragment + ' '; 
      }
    }
    setTranscript((prevTranscript) => prevTranscript + newTranscript);
    onTranscript(transcript + newTranscript);
  };

  useEffect(() => {
    listening ? startListening() : stopListening();
    return stopListening;
  }, [listening]);

  return (
    <div>  
        <p>{transcript}</p>
        <button onMouseDown={startListening} onMouseUp={stopListening}>
        Press & speak
      </button>
       <button onClick={clearTranscript}>Clear</button>

    
    </div>
  );
};

export default SpeechToText;