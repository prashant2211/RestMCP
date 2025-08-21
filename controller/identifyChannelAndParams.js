import OpenAI from "openai";
import { channelDescriptions } from "./channelMap.js";
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

// import channelInfo from './channelConfig.json' assert { type: 'json' };

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function identifyChannelAndParams(userPrompt) {
    const channelInfo = await getChannelInfo();
  const channelList = Object.entries(channelInfo)
    .map(([key, desc]) => `- ${key}: ${desc}`)
    .join("\n");

  const prompt = `
You are an assistant. Given the user prompt and a list of Salesforce channel descriptions,
select the most relevant channel name and extract any parameters needed to call that channel.

Channels:
${channelList}

Respond ONLY in JSON format:
{
  "channelName": "<matching_channel_name>",
  "params": {
    "key1": "value1",
    "key2": "value2"
  }
}

If no match, return:
{
  "channelName": "unknown",
  "params": {}
}

User Prompt:
"""${userPrompt}"""
`.trim();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3
  });

  const response = completion.choices[0].message.content.trim();
  const json = response.slice(response.indexOf('{'), response.lastIndexOf('}') + 1);
  return JSON.parse(json);
}

async function getChannelInfo() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const jsonPath = path.join(__dirname, 'channelConfig.json');
    const fileContent = await readFile(jsonPath, 'utf-8');
    const channelInfo = JSON.parse(fileContent);

    return channelInfo;
  } catch (err) {
    console.error('❌ Failed to read channel config:', err);
    throw err;
  }
}
