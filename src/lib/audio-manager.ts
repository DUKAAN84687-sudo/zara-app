export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export class AudioCaptureManager {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onData: (base64Pcm: string) => void) {}

  async start() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
    } catch (error: any) {
      if (error.name === "NotFoundError" || error.message.includes("Requested device not found")) {
        throw new Error("No microphone found. Please connect a microphone or use a device that has one to use Luna.");
      } else if (error.name === "NotAllowedError") {
        throw new Error("Microphone access denied. Please allow microphone access in your browser settings.");
      }
      throw error;
    }
    this.audioContext = new AudioContext({ sampleRate: 16000 });
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
    
    // ScriptProcessor is legacy but works well across browsers for raw PCM
    this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);
    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Check for silent input
      let hasSound = false;
      for (let i = 0; i < inputData.length; i++) {
        if (Math.abs(inputData[i]) > 0.01) {
          hasSound = true;
          break;
        }
      }
      
      const pcm16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      this.onData(arrayBufferToBase64(pcm16.buffer));
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
    console.log("Audio capture started", this.audioContext.sampleRate);
  }

  stop() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }
}

export class AudioPlaybackManager {
  private audioContext: AudioContext;
  private nextPlayTime: number = 0;

  constructor() {
    this.audioContext = new AudioContext({ sampleRate: 24000 });
  }

  async playChunk(base64Pcm: string) {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const pcm16 = new Int16Array(base64ToArrayBuffer(base64Pcm));
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 0x8000;
    }
    
    const buffer = this.audioContext.createBuffer(1, float32.length, 24000);
    buffer.copyToChannel(float32, 0);
    
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    
    if (this.nextPlayTime < this.audioContext.currentTime) {
      this.nextPlayTime = this.audioContext.currentTime;
    }
    
    source.start(this.nextPlayTime);
    this.nextPlayTime += buffer.duration;
  }
  
  stop() {
    this.nextPlayTime = 0;
    // Fast way to stop everything is suspending & clearing
    this.audioContext.close();
    this.audioContext = new AudioContext({ sampleRate: 24000 });
  }

  get state() {
    return this.audioContext.state;
  }
}
