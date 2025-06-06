import { makeAutoObservable } from "mobx";
import AudioAction from "../actions/AudioAction";
import RecordAction from "../actions/RecordAction";
import WhisperAction from "../actions/WhisperAction";
import GeminiAction from "../actions/GeminiAction";

export interface AudioData {
  blob: Blob;
  questionIdx: number;
}

export default class QnAStore {
  questions: string[] = [];
  answers: string[] = [];
  results: string[] = [];
  currentQuestionIndex: number = 0;
  private pendingJobs = new Set<number>();

  micStream: MediaStream | null = null;
  audioAction: AudioAction;
  recordAction: RecordAction;
  whisperAction: WhisperAction;
  geminiAction: GeminiAction;

  constructor() {
    makeAutoObservable(this);

    this.audioAction = new AudioAction(this);
    this.recordAction = new RecordAction(this);
    this.whisperAction = new WhisperAction(this);
    this.geminiAction = new GeminiAction(this);
  }

  setMicStream(stream: MediaStream | null) {
    this.micStream = stream;
  }

  requestNextQuestion() {
    this.currentQuestionIndex++;
  }
  enqueueAudioData = (audioData: AudioData) => {
    this.pendingJobs.add(audioData.questionIdx);

    this.whisperAction.pushTranscribeJob(audioData);
  };

  dequeueAudioData = (questionIdx: number) => {
    this.pendingJobs.delete(questionIdx);
  };

  get isProcessing() {
    return this.pendingJobs.size > 0;
  }
}
