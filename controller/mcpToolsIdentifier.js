import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: "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", // Use env var in prod
});

const toolsList = [
  { name: "getWeatherData", description: "Fetch weather data for a specified city", channelName: "Get_Wether" },
  { name: "getMovieRating", description: "Fetch movie rating by title", channelName: "Get_Movie_Ratings" },
  { name: "getSalesforceRecord", description: "Fetch Account Record From Salesforce", channelName: "Get_Salesforce_Record" },
  { name: "createSalesforceAccountRecord", description: "Create Account Record in Salesforce", channelName: "Record_creation" }
];

export default async function identifyToolAndParams(userMessage) {
  try {
    const toolDescriptions = toolsList
      .map(t => `- ${t.name}: ${t.description}. Channel name: ${t.channelName}`)
      .join("\n");

    const prompt = `
You are an assistant that receives a user message and must identify the best matching tool from this list ONLY:
${toolDescriptions}

Respond ONLY with a JSON object of this form:
{
  "tool": "<toolName>",
  "params": { ... },
  "channelName": "<channelName>"
}

If no tool matches, respond with:
{
  "tool": "unknown",
  "params": {},
  "channelName": ""
}

User message:
"""${userMessage}"""
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      top_p: 1,
      presence_penalty: 0,
      frequency_penalty: 0,
    });

    const text = completion.choices[0].message.content.trim();
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON object found in response");
    }

    const jsonString = text.substring(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(jsonString);

    return parsed;

  } catch (error) {
    console.error("Error parsing tool identification result:", error);
    throw new Error("Failed to parse tool identification result.");
  }
}
