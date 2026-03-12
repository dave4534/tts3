import { useEffect, useState } from "react";
import { getVoices, type Voice } from "@/lib/api";

export function useVoices(): {
  voices: Voice[];
  loading: boolean;
  error: string | null;
} {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVoices()
      .then((data) => setVoices(data.voices))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load voices"))
      .finally(() => setLoading(false));
  }, []);

  return { voices, loading, error };
}
