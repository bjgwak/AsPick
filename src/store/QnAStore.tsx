import { makeObservable, observable, action } from "mobx";

export default class QnAStore {
  constructor() {
    makeObservable(this, { questions: observable, answers: observable });
  }
  questions: string[] = [];
  answers: string[] = [];
  results: string[] = [];

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
