import { GoogleGenAI, Modality, Type } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const sessionPromise = ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      callbacks: {
        onopen: () => { console.log('OPEN'); process.exit(0); },
        onclose: (e: any) => { console.log('CLOSE', e); process.exit(1); },
        onerror: (e: any) => { console.error('ERROR', e); process.exit(1); },
        onmessage: (m: any) => { console.log('MSG'); }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
        },
        systemInstruction: { parts: [{ text: "You are a helpful assistant" }] },
        tools: [{
          functionDeclarations: [
            {
              name: "openWebsite",
              description: "Opens a website URL in a new tab.",
              parameters: { type: Type.OBJECT, properties: { url: { type: Type.STRING, description: "url" } }, required: ["url"] }
            },
            {
              name: "searchYouTube",
              description: "Searches YouTube",
              parameters: { type: Type.OBJECT, properties: { query: { type: Type.STRING, description: "query" } }, required: ["query"] }
            },
            {
              name: "saveMemory",
              description: "Saves memory",
              parameters: { type: Type.OBJECT, properties: { content: { type: Type.STRING } }, required: ["content"] }
            },
            {
              name: "sendWhatsAppMessage",
              description: "WhatsApp message",
              parameters: { type: Type.OBJECT, properties: { message: { type: Type.STRING, description: "msg" }, phoneNumber: { type: Type.STRING, description: "phone" } }, required: ["message"] }
            }
          ]
        }]
      }
    });
    await sessionPromise;
  } catch (err) {
    console.error("Test failed: ", err);
    process.exit(1);
  }
}
run();
