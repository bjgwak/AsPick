import { makeObservable, observable, action } from "mobx";

export default class QnAStore {
  constructor() {
    makeObservable(this, { questions: observable, answers: observable });
  }
  questions: string[] = [];
  answers: string[] = [];

  async queryQuestions(keywords: Set<string>) {
    //query something

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log("done");
        resolve();
      }, 5000);
    });

    this.answers = new Array(this.questions.length).fill("");
    return ["1", "2", "3"];
  }

  submitAnswer(idx: number, answer: string) {
    this.answers[idx] = answer;
    console.log(this.answers);
  }
}
