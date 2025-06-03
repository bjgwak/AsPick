import { makeAutoObservable, runInAction, when } from "mobx";

import type QnAStore from "../store/QnAStore";
import type { AudioData } from "../store/QnAStore";

const kIntervalAudio_ms = 1000;

export default class RecordAction {
  private store: QnAStore | undefined;
  private mediaRecorder: MediaRecorder | undefined;
  isRecording: boolean;
  currentRecordingIdx: number;

  constructor(qnaStore: QnAStore) {
    this.store = qnaStore;

    this.isRecording = false;
    this.currentRecordingIdx = 0;
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
      this.store?.enqueueAudioData({
        blob: blob,
        questionIdx: this.currentRecordingIdx,
      } as AudioData);
      runInAction(() => {
        this.isRecording = false;
      });
    };
    this.mediaRecorder.start(kIntervalAudio_ms);
    runInAction(() => {
      this.isRecording = true;
    });

    console.log("record started");
  }

  // stop recording
  async stopRecord(idx: number) {
    if (this.mediaRecorder) {
      const done = when(() => !this.isRecording);
      this.currentRecordingIdx = idx;
      this.mediaRecorder.stop();
      this.mediaRecorder = undefined;
      await done;
      console.log("record stopped");
    }
  }
}
