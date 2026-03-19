import { useState, useCallback, useEffect } from "react";
import { TextInput, MAX_WORDS, countWords } from "@/components/TextInput";
import { FileUpload } from "@/components/FileUpload";
import { VoiceSelector } from "@/components/VoiceSelector";
import { SelectedVoicePill } from "@/components/SelectedVoicePill";
import { MobileVoiceBar } from "@/components/MobileVoiceBar";
import { VoiceSheet } from "@/components/VoiceSheet";
import { BottomBar } from "@/components/BottomBar";
import { Button } from "@/components/ui/button";
import { useVoices } from "@/hooks/useVoices";
import { useConvert } from "@/hooks/useConvert";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggleIcon } from "@/components/ThemeToggleIcon";
import { cn } from "@/lib/utils";
import {
  MAIN_PADDING_BOTTOM_IDLE_PX,
  MAIN_PADDING_BOTTOM_WITH_TEXT_PX,
} from "@/lib/layout-constants";

function App() {
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const { voices, loading: voicesLoading, error: voicesError } = useVoices();
  const { state: convertState, startConvert, reset } = useConvert();
  const { theme, toggleTheme } = useTheme();

  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [voiceSheetOpen, setVoiceSheetOpen] = useState(false);
  const [pendingVoiceId, setPendingVoiceId] = useState<string | null>(null);

  useEffect(() => {
    if (voices.length === 0) return;
    const enabled = voices.filter((v) => v.enabled !== false && !(v.enabled == null && !v.preview_url));
    const firstEnabled = enabled[0]?.id;
    if (!voiceId) {
      if (firstEnabled) setVoiceId(firstEnabled);
      return;
    }
    const current = voices.find((v) => v.id === voiceId);
    const currentDisabled = current?.enabled === false || (current?.enabled == null && !current?.preview_url);
    if (currentDisabled && firstEnabled) {
      setVoiceId(firstEnabled);
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

  const openVoiceSheet = useCallback(() => {
    setPendingVoiceId(voiceId);
    setVoiceSheetOpen(true);
  }, [voiceId]);

  const closeVoiceSheet = useCallback(() => {
    setVoiceSheetOpen(false);
  }, []);

  const handleClear = useCallback(() => {
    reset();
    setText("");
    setPendingFile(null);
    setApiError(null);
  }, [reset]);

  const confirmVoiceSelection = useCallback(() => {
    const voice = voices.find((v) => v.id === pendingVoiceId);
    const voiceOk = voice && voice.enabled !== false && !(voice.enabled == null && !voice.preview_url);
    if (pendingVoiceId && voiceOk) {
      setVoiceId(pendingVoiceId);
    }
    setVoiceSheetOpen(false);
  }, [pendingVoiceId, voices]);

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

  const showFileUpload =
    bottomBarStatus === "idle" && text.trim().length === 0;

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

      <div className="flex min-h-0 flex-1 flex-col min-[600px]:flex-row overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col min-w-0">
          <main
            className={cn(
              "flex min-h-[40vh] flex-1 flex-col overflow-hidden px-4 pt-6 sm:min-h-0 sm:px-6"
            )}
            style={{
              paddingBottom: showFileUpload
                ? `${MAIN_PADDING_BOTTOM_IDLE_PX}px`
                : `${MAIN_PADDING_BOTTOM_WITH_TEXT_PX}px`,
            }}
          >
            {(convertState.status === "failed" || apiError) && (
              <div className="mb-4 w-full rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
                <div className="flex items-start justify-between gap-4">
                  <p className="min-w-0 flex-1 text-sm text-red-700 dark:text-red-300">
                    {convertState.status === "failed"
                      ? convertState.error
                      : apiError}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => {
                      if (convertState.status === "failed") reset();
                      setApiError(null);
                    }}
                  >
                    Try again
                  </Button>
                </div>
              </div>
            )}
            <section
              className={cn(
                "flex min-h-0 w-full flex-1 flex-col gap-6"
              )}
            >
              <div className="flex items-center justify-between gap-3 max-[599px]:hidden">
                <div className="flex items-center gap-3 pl-0">
                  {selectedVoice && (
                    <SelectedVoicePill
                      name={selectedVoice.name}
                      index={selectedVoiceIndex}
                    />
                  )}
                </div>
                {(bottomBarStatus === "complete" || text.trim().length > 0) && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="shrink-0 text-xs font-medium hover:underline"
                    style={{ color: "var(--app-text)" }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex min-[600px]:hidden items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {selectedVoice && (
                    <MobileVoiceBar
                      voiceName={selectedVoice.name}
                      voiceIndex={selectedVoiceIndex}
                      onChangeVoice={openVoiceSheet}
                      disabled={isConverting}
                    />
                  )}
                </div>
                {(bottomBarStatus === "complete" || text.trim().length > 0) && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="shrink-0 text-xs font-medium hover:underline"
                    style={{ color: "var(--app-text)" }}
                  >
                    Clear
                  </button>
                )}
              </div>

              <TextInput
                value={text}
                onChange={setText}
                disabled={isConverting}
                className="w-full pl-0"
                hasDragDropBelow={showFileUpload}
              />
              {pendingFile && (
                <p className="shrink-0 text-sm" style={{ color: "var(--app-text-muted)" }}>
                  File: {pendingFile.name}
                </p>
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

        <aside className="hidden min-[600px]:flex w-full shrink-0 flex-col border-t min-[600px]:w-80 min-[600px]:max-h-[calc(100vh-80px)] min-[600px]:border-l min-[600px]:border-t-0 min-[600px]:self-start lg:w-96 min-h-0" style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-aside-bg)' }}>
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

      {showFileUpload && (
        <FileUpload
          onFileSelect={handleFileSelect}
          onError={setApiError}
          disabled={isConverting}
        />
      )}

      <VoiceSheet
        open={voiceSheetOpen}
        onClose={closeVoiceSheet}
        voices={voices}
        selectedId={pendingVoiceId ?? voiceId}
        onSelect={setPendingVoiceId}
        onConfirm={confirmVoiceSelection}
        loading={voicesLoading}
        disabled={isConverting}
      />
    </div>
  );
}

export default App;
