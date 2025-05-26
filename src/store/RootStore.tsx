// stores/RootStore.ts
import KeywordStore from "./KeywordStore";
import QnAStore from "./QnAStore";

export default class RootStore {
  keywordStore: KeywordStore;
  qnaStore: QnAStore; // QnAStore 추가

  constructor() {
    this.keywordStore = new KeywordStore();
    this.qnaStore = new QnAStore(); // QnAStore 인스턴스 생성
    // 필요하다면 여기서 스토어 간의 참조를 설정할 수도 있습니다.
    // 예: this.keywordStore.setRootStore(this);
  }
}

// 루트 스토어 인스턴스 생성 (싱글톤으로 사용)
