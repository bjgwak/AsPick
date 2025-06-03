import { makeAutoObservable, reaction } from "mobx";
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

  async queryResultsToStore() {
    //query something
    //this.pendingJobs가 모두 없어질 때까지 대기한 뒤, 네트워크에 쿼리

    await new Promise<void>((resolve) => {
      reaction(
        () => this.pendingJobs.size,
        (size, _prev, _) => {
          if (size === 0) {
            resolve(); // 대기 종료
          }
        }
      );
    });
    this.results = new Array(this.questions.length).fill("");

    for (let i = 0; i < this.results.length; i++) {
      this.results[i] = `${this.answers[i]}`;
    }
    return true;
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
