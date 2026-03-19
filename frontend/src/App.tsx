import { useState, useCallback, useEffect } from "react";
import { TextInput, MAX_WORDS, countWords } from "@/components/TextInput";
import { FileUpload } from "@/components/FileUpload";
import { VoiceSelector } from "@/components/VoiceSelector";
import { ProgressBar } from "@/components/ProgressBar";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Button } from "@/components/ui/button";
import { useVoices } from "@/hooks/useVoices";
import { useConvert } from "@/hooks/useConvert";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

function App() {
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const { voices, loading: voicesLoading, error: voicesError } = useVoices();
  const { state: convertState, startConvert, reset } = useConvert();

  const [voiceId, setVoiceId] = useState<string | null>(null);

  useEffect(() => {
    if (voices.length > 0 && !voiceId) {
      setVoiceId(voices[0].id);
    }
  }, [voices, voiceId]);

  const canConvert =
    (text.trim().length > 0 || pendingFile) &&
    voiceId &&
    countWords(text) <= MAX_WORDS;

  const isConverting =
    convertState.status === "submitting" || convertState.status === "polling";

  const handleFileSelect = useCallback((file: File, extractedText: string) => {
    setPendingFile(file);
    setText(extractedText);
    setApiError(null);
  }, []);

  const handleConvert = useCallback(() => {
    if (!voiceId || !canConvert) return;
    setApiError(null);
    const input = pendingFile && text === "" ? pendingFile : text.trim();
    if (typeof input === "string" && !input) return;
    startConvert(input, voiceId);
  }, [voiceId, canConvert, pendingFile, text, startConvert]);

  const handleStartOver = useCallback(() => {
    reset();
    setText("");
    setPendingFile(null);
    setApiError(null);
  }, [reset]);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="text-center">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-stone-900">
          Voicecraft
        </h1>
        <p className="mt-2 text-base text-stone-600">
          Transform your text into natural audio
        </p>
      </header>

      <section className="space-y-3">
        <label className="text-sm font-semibold text-stone-800">Your text</label>
        <TextInput value={text} onChange={setText} disabled={isConverting} />
        <FileUpload
          onFileSelect={handleFileSelect}
          onError={setApiError}
          disabled={isConverting}
        />
        {pendingFile && (
          <p className="text-sm text-stone-500">File: {pendingFile.name}</p>
        )}
      </section>

      <section className="space-y-3">
        <label className="text-sm font-semibold text-stone-800">
          Choose a voice
        </label>
        {voicesError && (
          <p className="text-sm text-red-600">{voicesError}</p>
        )}
        <VoiceSelector
          voices={voices}
          selectedId={voiceId}
          onSelect={setVoiceId}
          loading={voicesLoading}
          disabled={isConverting}
        />
      </section>

      <section className="space-y-4">
        {convertState.status === "idle" && (
          <Button
            size="lg"
            disabled={!canConvert}
            onClick={handleConvert}
            className={cn(
              "w-full rounded-xl py-6 text-lg font-medium",
              "bg-teal-600 hover:bg-teal-700 text-white"
            )}
          >
            <Sparkles className="mr-2 size-5" />
            Convert to Audio
          </Button>
        )}

        {(convertState.status === "submitting" ||
          convertState.status === "polling") && (
          <ProgressBar
            progress={
              convertState.status === "polling"
                ? convertState.progress
                : 0
            }
            state={
              convertState.status === "polling"
                ? convertState.state
                : "queued"
            }
          />
        )}

        {convertState.status === "complete" && (
          <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6">
            <h3 className="font-medium text-stone-800">Your audio</h3>
            <AudioPlayer src={convertState.downloadUrl} />
            <div className="flex flex-wrap gap-3">
              <a
                href={convertState.downloadUrl}
                download="tts-output.mp3"
                className="inline-flex items-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                Download MP3
              </a>
              <button
                type="button"
                onClick={handleStartOver}
                className="text-sm font-medium text-teal-600 hover:underline"
              >
                Start Over
              </button>
            </div>
          </div>
        )}

        {(convertState.status === "failed" || apiError) && (
          <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {convertState.status === "failed"
                ? convertState.error
                : apiError}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (convertState.status === "failed") reset();
                setApiError(null);
              }}
            >
              Try again
            </Button>
          </div>
        )}
      </section>

      <footer className="mt-auto pt-8 text-center text-sm text-stone-500">
        Powered by advanced text-to-speech technology
      </footer>
    </div>
  );
}

export default App;
