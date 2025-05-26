import { makeObservable, observable, action } from "mobx";

const initialKeywords: string[] = ["react", "typescript", "mobx"];

export default class KeywordStore {
  keywords: Set<string>;
  selectedKeywords: Set<string>;

  constructor() {
    makeObservable(this, {
      keywords: observable,
      selectedKeywords: observable,
      toggleKeywords: action,
      addKeywords: action,
      clearKeywords: action,
    });
    this.keywords = new Set(initialKeywords);
    this.selectedKeywords = new Set();
  }

  clearKeywords() {
    this.selectedKeywords = new Set();
  }

  toggleKeywords(target: string) {
    this.selectedKeywords.has(target)
      ? this.selectedKeywords.delete(target)
      : this.selectedKeywords.add(target);
  }

  addKeywords(target: string) {
    const lowerTarget = target.toLowerCase();
    if (
      this.keywords.has(lowerTarget) ||
      this.selectedKeywords.has(lowerTarget)
    )
      return;
    this.keywords.add(lowerTarget);
    this.selectedKeywords.add(lowerTarget);
  }
}
