import { GoogleGenAI, Modality, Type } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config();

function generateFakePcmBase64() {
    const pcm16 = new Int16Array(2048);
    for (let i = 0; i < 2048; i++) {
        pcm16[i] = Math.random() * 1000;
    }
    const buffer = pcm16.buffer;
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const sessionPromise = ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      callbacks: {
        onopen: () => { 
            console.log('OPEN'); 
            setInterval(() => {
                const base64Pcm = generateFakePcmBase64();
                sessionPromise.then(session => {
                    session.sendRealtimeInput({
                        audio: { mimeType: "audio/pcm;rate=16000", data: base64Pcm }
                    });
                });
            }, 100);
        },
        onclose: (e: any) => { console.log('CLOSE', e); process.exit(1); },
        onerror: (e: any) => { console.error('ERROR', e); process.exit(1); },
        onmessage: (m: any) => { console.log('MSG'); }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
        },
        systemInstruction: "You are a helpful assistant.",
      }
    });
    await sessionPromise;
  } catch (err) {
    console.error("Test failed: ", err);
    process.exit(1);
  }
}
run();
