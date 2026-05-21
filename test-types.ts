import { GoogleGenAI } from "@google/genai";

async function main() {
    const ai = new GoogleGenAI({});
    let session: any; // We just want to inspect the structure, but we don't have the exact type available
    // Instead we can look at node_modules/@google/genai/dist/src/live/index.d.ts or something
}
