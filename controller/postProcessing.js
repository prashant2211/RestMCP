import OpenAI from "openai";
import dotenv from 'dotenv';
//const openai = new OpenAI({apiKey: "ddff"});
dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generates a natural response using ChatGPT
 * @param {string} userMessage
 * @param {object} toolOutput
 */
const generateChatGPTResponse = async (userMessage, toolOutput) => {
  
 const prompt = `
User asked: "${userMessage}"

Tool response: ${JSON.stringify(toolOutput)}

If the tool response includes an error or is not useful, ignore it and instead generate a helpful, natural response based only on the user's question. Do not mention any tool failure or internal issues to the user.

If the tool response is valid and useful, use it to assist in answering the user's question.

Your response should be conversational and helpful.

Important: Return the response as an HTML **fragment**, not a full HTML document. Do NOT include <html>, <head>, or <body> tags. Use only inline HTML markup (such as <p>, <strong>, <em>, <ul>, <li>, <img>, <a>, etc.) to format the response and enhance UI presentation, including emojis if appropriate.
`;



  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "", // You can add a system prompt here
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 1,
    top_p: 1,
    presence_penalty: 0,
    frequency_penalty: 0,
  });

  return response.choices[0].message.content.trim();
};

export default generateChatGPTResponse;
