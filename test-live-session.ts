import { GoogleGenAI, Modality, Type } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const sessionPromise = ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      callbacks: {
        onopen: () => { console.log('OPEN'); },
        onerror: (err) => console.log('ERR', err),
        onmessage: (msg) => {
          console.log('MSG', msg.serverContent?.modelTurn?.parts ? true : false);
          process.exit(0);
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
        },
      }
    });
    const session = await sessionPromise;
    try {
      session.sendClientContent({ turns: [{ role: "user", parts: [{ text: "test" }] }] });
      console.log("SENT");
    } catch (e) {
      console.log("ERR in send", e);
    }
    process.exit(0);
  } catch (err) {
    console.error("Test failed: ", err);
    process.exit(1);
  }
}
run();
