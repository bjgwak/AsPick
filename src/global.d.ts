/* 전역 객체 확장 선언  */
export {};

declare global {
  interface Window {
    // helpers.js
    loadRemote?: (
      url: string,
      dst: string,
      sizeMb: number,
      onProgress: (p: number) => void,
      onReady: (dst: string, data: Uint8Array) => void,
      onCancel: () => void,
      logger: (...args: unknown[]) => void
    ) => void;

    // emscripten
    Module?: unknown;

    // IndexedDB 식별자
    dbName?: string;
    dbVersion?: number;
  }
}
