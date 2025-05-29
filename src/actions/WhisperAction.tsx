import { makeAutoObservable, runInAction } from "mobx";

const MODEL_URL = "https://whisper.ggerganov.com/ggml-model-whisper-tiny.bin";
const MODEL_FILE = "whisper.bin";
const MODEL_MB = 75;
const N_THREADS = 4;
const LANGUAGE = "ko"; // 고정
const PUBLIC_DIR = "/Whisper.wasm"; // public 하위 경로

type GlobalAny = Record<string, any>;

export default class WhisperAction {
  private module: any | null = null; // window.Module
  private instance: number | null = null; // whisper context ptr

  /** mobx observable */
  modelReady = false;
  loading = false;
  progress = 0;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /* ───────────────────────── script helpers ───────────────────────── */
  private loadScript = (url: string) =>
    new Promise<void>((res, rej) => {
      if (document.querySelector(`script[src="${url}"]`)) return res();
      const s = document.createElement("script");
      s.src = url;
      s.type = "text/javascript";
      s.onload = () => res();
      s.onerror = () => rej(new Error(`failed to load ${url}`));
      document.head.appendChild(s);
    });

  private async ensureRuntime() {
    if (this.module) return this.module;

    // 1) helpers.js (전역 loadRemote 노출)
    const g = window as any;
    if (!g.dbName) g.dbName = "whisper.ggerganov.com"; // 아무 이름이나 OK
    if (!g.dbVersion) g.dbVersion = 1;
    await this.loadScript(`${PUBLIC_DIR}/helpers.js`);
    if (!(window as GlobalAny).loadRemote)
      throw new Error("helpers.js not loaded");

    // 2) Module 셸 생성 → main.js 주입 → onRuntimeInitialized 대기
    if (!(window as GlobalAny).Module) {
      (window as GlobalAny).Module = {
        print: (...a: any[]) => console.log("[W]", ...a),
        printErr: (...a: any[]) => console.error("[W]", ...a),
      };
    }

    await new Promise<void>((res, rej) => {
      (window as GlobalAny).Module.onRuntimeInitialized = () => res();
      this.loadScript(`${PUBLIC_DIR}/main.js`).catch(rej);
    });

    this.module = (window as GlobalAny).Module;
    return this.module;
  }

  /* ─────────────────────── public: 모델 다운로드 ────────────────────── */
  async loadModel() {
    if (this.modelReady || this.loading) return;
    this.loading = true;
    this.error = null;

    try {
      const mod = await this.ensureRuntime();
      /** helpers.js 의 global 함수 */
      const loadRemote = (window as GlobalAny).loadRemote as Function;

      const storeFS = (fname: string, buf: Uint8Array) => {
        try {
          mod.FS_unlink(fname);
        } catch (_) {}
        mod.FS_createDataFile("/", fname, buf, true, true);
      };

      await new Promise<void>((resolve, reject) => {
        loadRemote(
          MODEL_URL,
          MODEL_FILE,
          MODEL_MB,
          (p: number) => runInAction(() => (this.progress = p)),
          storeFS,
          () => reject(new Error("user cancelled")),
          console.log
        );
        // loadRemote 콜백(storeFS) 가 끝나면 resolve
        resolve();
      });

      runInAction(() => (this.modelReady = true));
    } catch (e: any) {
      runInAction(() => (this.error = e?.message ?? String(e)));
    } finally {
      runInAction(() => (this.loading = false));
    }
  }

  /* ─────────────────────── public: 음성 → 텍스트 ────────────────────── */
  async transcribeBlob(blob: Blob): Promise<string> {
    if (!this.modelReady) throw new Error("모델이 아직 준비되지 않았습니다.");

    const mod = await this.ensureRuntime();

    // ① whisper 초기화 (1회)
    if (!this.instance) {
      this.instance = mod.init(MODEL_FILE);
      if (!this.instance) throw new Error("whisper init 실패");
    }

    // ② blob → Float32 PCM(16 kHz mono)
    const pcm = await this.blobToPCM(blob);

    // ③ 추론
    const ret = mod.full_default(
      this.instance,
      pcm,
      LANGUAGE,
      N_THREADS,
      /*translate=*/ false
    );

    console.log("whisper full_default ret:", ret); // 0 = OK

    // 결과 텍스트는 모듈의 print 콜백에서 모두 찍혀 나오므로
    // 간단히 join 해서 반환
    return pcm.length ? "(결과는 console 로 확인)" : "";
  }

  /* ─────────────── WebAudio 이용: blob → Float32Array ─────────────── */
  private async blobToPCM(blob: Blob): Promise<Float32Array> {
    const ab = await blob.arrayBuffer();
    const ctx = new AudioContext({ sampleRate: 16000 });
    const buf = await ctx.decodeAudioData(ab);
    return buf.getChannelData(0); // mono
  }
}
