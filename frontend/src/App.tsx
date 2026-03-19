import { useState, useCallback, useEffect } from "react";
import { TextInput, MAX_WORDS, countWords } from "@/components/TextInput";
import { FileUpload } from "@/components/FileUpload";
import { VoiceSelector } from "@/components/VoiceSelector";
import { SelectedVoicePill } from "@/components/SelectedVoicePill";
import { BottomBar } from "@/components/BottomBar";
import { Button } from "@/components/ui/button";
import { useVoices } from "@/hooks/useVoices";
import { useConvert } from "@/hooks/useConvert";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggleIcon } from "@/components/ThemeToggleIcon";

function App() {
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const { voices, loading: voicesLoading, error: voicesError } = useVoices();
  const { state: convertState, startConvert, reset } = useConvert();
  const { theme, toggleTheme } = useTheme();

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

  const selectedVoice = voices.find((v) => v.id === voiceId);
  const selectedVoiceIndex = selectedVoice
    ? voices.findIndex((v) => v.id === voiceId)
    : 0;

  const bottomBarStatus =
    convertState.status === "complete"
      ? "complete"
      : isConverting
        ? "converting"
        : "idle";

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="relative shrink-0 flex h-[80px] items-center border-b pl-4 pr-4 sm:pl-6 sm:pr-6" style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-sidebar-bg)' }}>
        <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-1" style={{ color: "var(--app-text)" }}>
          <h1 className="m-0 font-serif text-2xl font-bold tracking-tight sm:text-xl">
            Voicecraft
          </h1>
          <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
            Transform your text into natural audio
          </p>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-sidebar-bg)] sm:right-6"
          style={{ color: "var(--app-text)" }}
        >
          <ThemeToggleIcon theme={theme} />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
        <div className="flex min-h-0 flex-1 flex-col">
          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 pb-[180px] sm:px-6 sm:pb-[180px]">
            <section className="max-w-2xl space-y-3">
              <div className="flex items-center gap-3 pl-0">
                {selectedVoice && (
                  <SelectedVoicePill
                    name={selectedVoice.name}
                    index={selectedVoiceIndex}
                  />
                )}
              </div>

              <TextInput value={text} onChange={setText} disabled={isConverting} className="pl-0" />
              {pendingFile && (
                <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
                  File: {pendingFile.name}
                </p>
              )}

              {(convertState.status === "failed" || apiError) && (
                <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
                  <p className="text-sm text-red-700 dark:text-red-300">
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
          </main>

          <BottomBar
            status={bottomBarStatus}
            canConvert={!!canConvert}
            onConvert={handleConvert}
            progress={
              convertState.status === "polling" ? convertState.progress : 0
            }
            progressState={
              convertState.status === "polling" ? convertState.state : "queued"
            }
            downloadUrl={
              convertState.status === "complete" ? convertState.downloadUrl : undefined
            }
            wordCount={countWords(text)}
          />
        </div>

        <aside className="flex w-full shrink-0 flex-col border-t sm:w-80 sm:max-h-[calc(100vh-80px)] sm:border-l sm:border-t-0 sm:self-start lg:w-96" style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-aside-bg)' }}>
          <div className="shrink-0 border-b px-4 py-3" style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-sidebar-bg)' }}>
            <h2 className="text-sm font-semibold" style={{ color: "var(--app-text)" }}>
              Choose a voice
            </h2>
          </div>
          <div className="max-h-[calc(100vh-128px)] overflow-y-auto overflow-x-hidden px-4 py-3">
            {voicesError && (
              <p className="mb-2 text-sm text-red-600 dark:text-red-400">{voicesError}</p>
            )}
            <VoiceSelector
              voices={voices}
              selectedId={voiceId}
              onSelect={setVoiceId}
              loading={voicesLoading}
              disabled={isConverting}
            />
          </div>
        </aside>
      </div>

      {bottomBarStatus === "idle" && (
        <FileUpload
          onFileSelect={handleFileSelect}
          onError={setApiError}
          disabled={isConverting}
        />
      )}

      <footer className="hidden px-4 py-3 text-center text-sm sm:block" style={{ color: "var(--app-text-muted)" }}>
        Powered by advanced text-to-speech technology
      </footer>
    </div>
  );
}

export default App;
