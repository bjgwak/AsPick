import { makeAutoObservable, runInAction } from "mobx";
import type QnAStore from "../store/QnAStore";
import type { AudioData } from "../store/QnAStore";

// ──────────────────── 환경 상수 ────────────────────
const MODEL_URL = "https://whisper.ggerganov.com/ggml-model-whisper-tiny.bin";
const MODEL_FILE = "whisper.bin";
const MODEL_MB = 75;
const LANGUAGE = "ko";
const N_THREADS = 4;
const PUBLIC_DIR = "/Whisper.wasm";

// whisper.cpp 에서 실제로 쓰는 기능만 골라 타입화
interface WhisperModule {
  FS_createDataFile(
    dir: string,
    name: string,
    data: Uint8Array,
    r: boolean,
    w: boolean
  ): void;
  FS_unlink(path: string): void;
  init(modelPath: string): number; // returns ctx pointer
  full_default(
    ctx: number,
    pcm: Float32Array,
    lang: string,
    nThreads: number,
    translate: 0 | 1
  ): number;
  onRuntimeInitialized?: () => void;
}

export default class WhisperAction {
  // 런타임 정보
  private module: WhisperModule | null = null;
  private ctxPtr: number | null = null;

  // mobx Observable
  modelReady = false;
  loading = false;
  progress = 0;
  error: string | null = null;

  private qnaStore?: QnAStore;

  private jobQueue: AudioData[] = [];
  private currentJob: AudioData | null = null;
  private currentTranscribedText: string = "";
  private debounceTimer: number | null = null;
  constructor(qnaStore: QnAStore) {
    makeAutoObservable(this);
    this.qnaStore = qnaStore;
  }

  // ───────────────────── 추가: 출력 파서 ─────────────────────
  private handlePrint = (args: unknown[]) => {
    const line = args.map(String).join(" ");

    const m = line.match(
      /^\s*\[\d{2}:\d{2}:\d{2}\.\d+\s+-->\s+\d{2}:\d{2}:\d{2}\.\d+\]\s*(.*)$/
    );
    if (!m || !m[1]) return; // 타임코드 라인이 아니면 무시

    const text = m[1].trim();
    if (!text) return;
    //TODO: 상수화
    runInAction(() => {
      this.currentTranscribedText += text;
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = window.setTimeout(() => this.finalizeJob(), 3000);
    });
  };

  /** 동적으로 <script> 주입 */
  private loadScript = (url: string) =>
    new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${url}"]`)) return resolve();
      const s = document.createElement("script");
      s.src = url;
      s.type = "text/javascript";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`failed to load ${url}`));
      document.head.appendChild(s);
    });

  private async ensureRuntime(): Promise<WhisperModule> {
    if (this.module) return this.module;

    window.dbName ??= "whisper-cache";
    window.dbVersion ??= 1;

    await this.loadScript(`${PUBLIC_DIR}/helpers.js`);
    if (typeof window.loadRemote !== "function") {
      throw new Error("helpers.js failed to expose loadRemote");
    }

    if (!window.Module) {
      window.Module = {
        print: (...a: unknown[]) => {
          this.handlePrint(a);
        },
        printErr: (...a: unknown[]) => {},
      } as Partial<WhisperModule>;
    }

    await new Promise<void>((res, rej) => {
      (window.Module as WhisperModule).onRuntimeInitialized = () => res();
      this.loadScript(`${PUBLIC_DIR}/main.js`).catch(rej);
    });

    this.module = window.Module as WhisperModule;
    return this.module;
  }

  // ──────────────────── public API ────────────────────
  /** 1회만 호출 – 모델 다운로드 & 파일시스템 등록 */
  async loadModel() {
    if (this.modelReady || this.loading) return;

    this.loading = true;
    this.error = null;
    this.progress = 0;

    try {
      const mod = await this.ensureRuntime();
      const loadRemote = window.loadRemote!;

      await new Promise<void>((resolve, reject) => {
        const storeFS = (fname: string, buf: Uint8Array) => {
          try {
            mod.FS_unlink(fname);
          } catch {}
          mod.FS_createDataFile("/", fname, buf, true, true);
          resolve();
        };

        loadRemote(
          MODEL_URL,
          MODEL_FILE,
          MODEL_MB,
          (p) => runInAction(() => (this.progress = p)),
          storeFS,
          () => reject(new Error("사용자가 다운로드를 취소했습니다.")),
          console.log
        );
      });

      runInAction(() => (this.modelReady = true));
    } catch (err: unknown) {
      runInAction(() => {
        this.error = (err as Error).message;
        this.modelReady = false;
      });
    } finally {
      runInAction(() => (this.loading = false));
    }
  }

  pushTranscribeJob(audioData: AudioData) {
    this.jobQueue.push(audioData);
    console.log("drain start:", this.jobQueue);
    this.drain();
  }

  private async drain() {
    if (this.currentJob || !this.jobQueue.length) return;

    this.currentJob = this.jobQueue.shift()!;
    this.transcribeBlob(this.currentJob.blob); // blocking
    this.drain(); // 다음 job
  }

  private finalizeJob() {
    if (!this.qnaStore || !this.currentJob) return;

    this.qnaStore.answers[this.currentJob.questionIdx] =
      this.currentTranscribedText.trim();
    this.qnaStore.dequeueAudioData(this.currentJob.questionIdx);

    this.currentJob = null;
    this.currentTranscribedText = "";
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = null;
    console.log("finalize: ", this.qnaStore.answers);
    // 다음 큐로
    this.drain();
  }
  /** MediaRecorder blob → 자막 문자열 (콘솔에 전체 로그도 남음) */
  //TODO: 이미 질문이 처리중이면 기다렸다가 넘겨야겠는데?
  async transcribeBlob(blob: Blob) {
    if (!this.modelReady) throw new Error("모델이 아직 준비되지 않았습니다.");
    if (!blob) throw new Error("blob이 없습니다.");
    const mod = await this.ensureRuntime();

    // whisper context 초기화 (once)
    if (!this.ctxPtr) {
      this.ctxPtr = mod.init(MODEL_FILE);
      if (!this.ctxPtr) throw new Error("whisper init 실패");
    }

    // blob → 16 kHz mono Float32 PCM
    const pcm = await this.blobToPCM(blob);

    const ret = mod.full_default(this.ctxPtr, pcm, LANGUAGE, N_THREADS, 0);
    console.log("whisper full_default ret:", ret);
  }

  // ──────────────────── util ────────────────────
  private async blobToPCM(blob: Blob): Promise<Float32Array> {
    const data = await blob.arrayBuffer();
    const ctx = new AudioContext({ sampleRate: 16000 });
    const buf = await ctx.decodeAudioData(data);
    return buf.getChannelData(0);
  }
}
