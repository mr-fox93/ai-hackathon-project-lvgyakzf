// src/App.tsx
import React, { useState } from "react";
import { fetchChatCompletion } from "./apiService";

const App: React.FC = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState({});

  const handleSubmit = async () => {
    const result = await fetchChatCompletion(input);
    setResponse(result);
    console.log(result);
  };

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={handleSubmit}>Send</button>
      <pre>{JSON.stringify(response, null, 2)}</pre>{" "}
    </div>
  );
};

export default App;
