import React, { useEffect, useState } from "react";
import { fetchMessageContents } from "./services/supabaseService";

type MessageContent = {
  id: number;
  content: string;
};
function MessageDisplay() {
  const [contents, setContents] = useState<MessageContent[]>([]);
  useEffect(() => {
    const getContent = async () => {
      const messageContents = await fetchMessageContents();
      if (messageContents) {
        setContents(messageContents);
      }
    };

    getContent();
  }, []);

  // Funkcja do renderowania listy treści wiadomości
  const renderMessages = () => {
    return contents.map((message) => (
      <div className="message" key={message.id}>
        <strong>Message ID {message.id}:</strong> {message.content}
      </div>
    ));
  };

  return (
    <div>
      {contents.length > 0 ? renderMessages() : <p>No messages to display.</p>}
    </div>
  );
}

export default MessageDisplay;
