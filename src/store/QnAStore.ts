import { makeObservable, observable, action } from "mobx";
import AudioAction from "../actions/AudioAction";
import RecordAction from "../actions/RecordAction";
import WhisperAction from "../actions/WhisperAction";

export default class QnAStore {
  questions: string[] = [];
  answers: string[] = [];
  results: string[] = [];
  blob: Blob = new Blob();
  currentQuestionIndex: number = 0;

  micStream: MediaStream | null = null;
  audioAction: AudioAction;
  recordAction: RecordAction;
  whisperAction: WhisperAction;

  constructor() {
    makeObservable(this, {
      micStream: observable,
      setMicStream: action,
      questions: observable,
      answers: observable,
      results: observable,
    });

    this.audioAction = new AudioAction(this);
    this.recordAction = new RecordAction(this);
    this.whisperAction = new WhisperAction(this);
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
    this.questions = ["1", "2"];
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

  submitAnswer(idx: number, answer: string) {
    this.answers[idx] = answer;
    console.log(this.answers);
  }
}
