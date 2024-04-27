
import axios from "axios";
import config from "./config";

const baseURL = "https://training.nerdbord.io/api/v1/openai/chat";

export const fetchChatCompletion = async (inputMessage: string) => {
  try {
    const response = await axios.post(
      `${baseURL}/completions`,
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: inputMessage },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: config.API_KEY,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data: ", error);
    return null;
  }
};

export const createPromptForOpenAI = (quickMealInput: string) => {
  return `Bazując na tych składnikach: ${quickMealInput}, podaj mi prosty i szybki przepis do zrobienia.`;
};
