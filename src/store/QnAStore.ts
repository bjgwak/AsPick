import { makeAutoObservable } from "mobx";
import AudioAction from "../actions/AudioAction";
import RecordAction from "../actions/RecordAction";
import WhisperAction from "../actions/WhisperAction";

const sampleQuestions: string[] = [
  "a는 무엇인가요?",
  "b는 무엇인가요?",
  "c는 무엇인가요?",
];

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

  constructor() {
    makeAutoObservable(this);

    this.audioAction = new AudioAction(this);
    this.recordAction = new RecordAction(this);
    this.whisperAction = new WhisperAction(this);

    this.questions = [...sampleQuestions];
  }

  setMicStream(stream: MediaStream | null) {
    this.micStream = stream;
  }

  async queryQuestions(keywords: Set<string>) {
    //query something

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log("done");
        resolve();
      }, 2000);
    });

    this.answers = new Array(this.questions.length).fill("");

    return true;
  }

  async queryResults() {
    //query something
    this.results = new Array(this.questions.length).fill("");

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log("done");
        resolve();
      }, 2000);
    });

    for (let i = 0; i < this.results.length; i++) {
      this.results[i] = `${i}`;
    }
    return true;
  }

  requestNextQuestion() {
    this.currentQuestionIndex++;
  }
  enqueueAudioData = (audioData: AudioData) => {
    this.pendingJobs.add(audioData.questionIdx); //TODO: pendingJobs에서 빼는 조건은 어떻게?

    // WhisperAction은 즉시 반환하며, 실제 전사 완료 시 onResult 콜백이 실행된다.
    this.whisperAction.pushTranscribeJob(audioData);
  };

  get isProcessing() {
    return this.pendingJobs.size > 0;
  }
}
