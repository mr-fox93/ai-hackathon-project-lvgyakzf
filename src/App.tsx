import React, { useState } from "react";
import { fetchChatCompletion } from "./apiService";
import { saveAs } from "file-saver";
import SpeechToText from "./SpeechTotext";
import { deleteAllResponses, saveResponse } from "./services/supabaseService";
import MessageDisplay from "./MessageDisplay";

const App: React.FC = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState({});

  const handleTranscription = (transcript: string) => {
    setInput(transcript);
  };

  const handleSubmit = async () => {
    const result = await fetchChatCompletion(input);
    await saveResponse(result);
    setResponse(result);
    //saveResponseToFile(result);
  };

  const handleClear = () => {
    setInput("");
    setResponse({});
  };

  return (
    <div>
      <button onClick={() => deleteAllResponses().catch(console.error)}>
        Delete
      </button>
      <SpeechToText onTranscript={handleTranscription} onClear={handleClear} />
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={handleSubmit}>Send</button>
      {/* <pre>{JSON.stringify(response, null, 2)}</pre> */}
      <MessageDisplay />
    </div>
  );
};

export default App;
