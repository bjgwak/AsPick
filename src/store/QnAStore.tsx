import { makeObservable, observable, action } from "mobx";
import AudioAction from "../actions/AudioAction";

export default class QnAStore {
  constructor() {
    makeObservable(this, {
      micStream: observable,
      setMicStream: action,
      questions: observable,
      answers: observable,
      results: observable,
    });

    this.audioAction = new AudioAction();
  }

  questions: string[] = [];
  answers: string[] = [];
  results: string[] = [];

  micStream: MediaStream | null = null;

  setMicStream(stream: MediaStream | null) {
    this.micStream = stream;
  }

  audioAction: AudioAction;

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
