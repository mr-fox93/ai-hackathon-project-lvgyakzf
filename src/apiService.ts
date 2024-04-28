import axios from "axios";
import config from "./config";

const baseURL = "https://training.nerdbord.io/api/v1/openai/chat";


  export const fetchChatCompletion = async (
    prompt: string,
    setResponseFunction: Function,
    setLoadingFunction: Function
  ) => {
    setLoadingFunction(true);
    try {
      const response = await axios.post(
        `${baseURL}/completions`,
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: config.API_KEY,
          },
        }
      );
  
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const responseData = response.data;
  
  
      if (responseData && responseData.choices && responseData.choices.length > 0) {
      
        setResponseFunction(responseData.choices[0].message.content);
      } else {
        console.error("No choices found in response.");
        setResponseFunction("Wystąpił błąd podczas pobierania odpowiedzi.");
      }
    } catch (error) {
      console.error("Error calling GPT API:", error);
      setResponseFunction("Wystąpił błąd podczas pobierania odpowiedzi.");
    }
    setLoadingFunction(false);
  };
