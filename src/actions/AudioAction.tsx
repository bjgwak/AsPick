import { makeAutoObservable, runInAction } from "mobx";

import { useStore } from "../store/StoreContext";
import type QnAStore from "../store/QnAStore";

export default class AudioAction {
  private store: QnAStore | undefined;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrameId: number | null = null;

  devices: MediaDeviceInfo[] = [];
  selectedDeviceId: string = "";
  volume: number = 0;

  constructor() {
    const qnastore = useStore()?.qnaStore;
    if (!qnastore) return;
    this.store = qnastore;
    makeAutoObservable(this);
  }

  async init() {
    await this.fetchDevices();

    navigator.mediaDevices.addEventListener("devicechange", this.fetchDevices);
    if (this.devices.length > 0) {
      this.selectDevice(this.devices[0].deviceId);
    }
  }

  cleanup = () => {
    navigator.mediaDevices.removeEventListener(
      "devicechange",
      this.fetchDevices
    );
    this.stop();
  };

  private fetchDevices = async () => {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = allDevices.filter((d) => d.kind === "audioinput");
    runInAction(() => {
      this.devices = audioInputs;
    });
  };

  async selectDevice(deviceId: string) {
    this.stop();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId },
      video: false,
    });

    runInAction(() => {
      this.selectedDeviceId = deviceId;
    });

    if (this.store) {
      this.store.setMicStream(stream);
    }

    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    source.connect(this.analyser);

    this.listenVolume();
  }

  private listenVolume() {
    const loop = () => {
      if (this.analyser && this.dataArray) {
        this.analyser.getByteFrequencyData(this.dataArray);
        const avg =
          this.dataArray.reduce((a, b) => a + b, 0) / this.dataArray.length;
        runInAction(() => {
          this.volume = avg;
        });
        this.animationFrameId = requestAnimationFrame(loop);
      }
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.store && this.store.micStream) {
      this.store.micStream.getTracks().forEach((track) => track.stop());
      this.store.setMicStream(null);
    }
  }
}
