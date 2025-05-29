//reference: https://github.com/microsoft/onnxruntime-inference-examples/blob/main/js/ort-whisper/main.js
import { makeAutoObservable, runInAction } from "mobx";

import type QnAStore from "../store/QnAStore";

const kSampleRate = 16000;
const kIntervalAudio_ms = 1000;
const kSteps = kSampleRate * 30;
const kDelay = 100;
const kModel = "whisper_cpu_int8_0_model.onnx";

export default class RecordAction {
  private store: QnAStore | undefined;
  private mediaRecorder: MediaRecorder | undefined;
  isRecording: boolean;

  constructor(qnaStore: QnAStore) {
    this.store = qnaStore;

    this.isRecording = false;
    makeAutoObservable(this);
    if (this.store.micStream)
      this.mediaRecorder = new MediaRecorder(this.store.micStream);
  }

  startRecord() {
    if (this.store && this.store.micStream)
      this.mediaRecorder = new MediaRecorder(this.store.micStream);

    if (this.mediaRecorder === undefined) {
      return;
    }
    let recording_start = performance.now();
    let chunks: BlobPart[] | undefined = [];

    this.mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    this.mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
      if (this.store) {
        this.store.blob = blob;
        console.log(this.store.blob);
      }
    };
    this.mediaRecorder.start(kIntervalAudio_ms);
    this.isRecording = true;
    console.log("record started");
  }

  // stop recording
  stopRecord() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = undefined;
      this.isRecording = false;
      console.log("record stoped");
    }
  }
}
