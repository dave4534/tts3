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
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          Text to Speech
        </h1>
        <p className="mt-1 text-muted-foreground">
          Convert text to natural-sounding audio
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-stone-800">Input</h2>
        <TextInput value={text} onChange={setText} disabled={isConverting} />
        <FileUpload
          onFileSelect={handleFileSelect}
          onError={setApiError}
          disabled={isConverting}
        />
        {pendingFile && (
          <p className="text-sm text-muted-foreground">
            File: {pendingFile.name}
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-stone-800">Voice</h2>
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
              "bg-amber-500 hover:bg-amber-600 text-white"
            )}
          >
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
                className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
              >
                Download MP3
              </a>
              <button
                type="button"
                onClick={handleStartOver}
                className="text-sm font-medium text-amber-600 hover:underline"
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
    </div>
  );
}

export default App;
