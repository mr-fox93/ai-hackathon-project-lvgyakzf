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
