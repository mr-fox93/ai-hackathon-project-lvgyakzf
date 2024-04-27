import supabase from "../supabaseClient";

export const saveResponse = async (responseText) => {
  const { data, error } = await supabase
    .from("chat_responses")
    .insert([{ response_text: responseText }]);

  if (error) {
    console.error("Error saving data", error);
    return null;
  }

  return data;
};

/// get message from supabase database
export const fetchMessageContents = async () => {
  const { data, error } = await supabase
    .from("chat_responses")
    .select("id, response_text"); // Pobieramy id i response_text

  if (error) {
    console.error("Error fetching messages", error);
    return null;
  }

  return data.map((item) => {
    return {
      id: item.id,
      content: item.response_text.choices[0].message.content,
    };
  });
};
