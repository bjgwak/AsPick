//reference: https://github.com/microsoft/onnxruntime-inference-examples/blob/main/js/ort-whisper/main.js
import { makeAutoObservable } from "mobx";

import type QnAStore from "../store/QnAStore";

const kIntervalAudio_ms = 1000;

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
    if (this.store && this.store.micStream && !this.mediaRecorder)
      this.mediaRecorder = new MediaRecorder(this.store.micStream);

    if (this.mediaRecorder === undefined) {
      return;
    }

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
      console.log("record stopped");
    }
  }
}
