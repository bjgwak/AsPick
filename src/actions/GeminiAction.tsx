import { when } from "mobx";
import type QnAStore from "../store/QnAStore";

const geminiAPIURL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?";

export default class GeminiAction {
  private store: QnAStore;
  apiKey = "";

  constructor(store: QnAStore) {
    this.store = store;
  }

  setApiKey(key: string) {
    this.apiKey = key.trim();
  }

  private async request(prompt: string): Promise<string> {
    const url = `${geminiAPIURL}key=${this.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  }

  async queryQuestions(keywords: Set<string>) {
    if (!this.apiKey) throw new Error("Gemini API key not set");
    const prompt = `다음 키워드를 포함한 면접 질문 3개를 JSON 배열로 답해주세요: ${Array.from(
      keywords
    ).join(", ")}`;
    const text = await this.request(prompt);
    const questions = JSON.parse(text) as string[];
    this.store.questions = questions;
    this.store.answers = new Array(questions.length).fill("");
    return true;
  }

  async queryResults() {
    if (!this.apiKey) throw new Error("Gemini API key not set");
    await when(() => !this.store.isProcessing);

    const qas = this.store.questions
      .map((q, i) => `Q: ${q}\nA: ${this.store.answers[i]}`)
      .join("\n\n");

    const prompt = `다음 질문과 응답을 평가해 동일한 길이의 한국어 문자열 JSON 배열로 답해주세요.\n${qas}`;
    const text = await this.request(prompt);
    const results = JSON.parse(text) as string[];
    this.store.results = results;
    return true;
  }
}
