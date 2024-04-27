import React, { useState } from "react";
import { fetchChatCompletion } from "./apiService";
import { saveAs } from "file-saver";
import SpeechToText from "./SpeechTotext";
import { saveResponse } from "./services/supabaseService";
import MessageDisplay from "./MessageDisplay";
import Header from "./components/Header/Header";
import Button from "./components/Button/Button";
import Copyright from "./components/Copyright/Copyright";

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
      <Header />
      <div className="main">
        <SpeechToText
          onTranscript={handleTranscription}
          onClear={handleClear}
        />
        <div className="textbox">
          <input
            type="text"
            placeholder="or type here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={handleSubmit}>Send</Button>
        </div>

        {/* <pre>{JSON.stringify(response, null, 2)}</pre> */}
        <MessageDisplay />
        <Copyright />
      </div>
    </div>
  );
};

export default App;
