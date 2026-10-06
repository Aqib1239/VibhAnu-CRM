"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  RotateCcw,
  RotateCw,
  CheckCircle2,
  FileAudio,
  Loader2,
  AlertCircle,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider, clamp } from "@/components/ui/audio-slider";

// Re-export Slider and AudioSlider for backward compatibility
export { Slider, AudioSlider } from "@/components/ui/audio-slider";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface AudioPlayerProps {
  src?: string;
  fileName?: string;
  fileSize?: number;
  durationSeconds?: number;
  onNaturalEnd?: () => void;
  isCompleted?: boolean;
  requiredForAction?: string;
  /** When true, listener cannot skip past the furthest point already heard */
  disableForwardSeek?: boolean;
  /** Optional explicit MIME type (e.g. "audio/aac", "audio/wav", "audio/mpeg") */
  mimeType?: string;
  /** Pass the uploaded File/Blob directly */
  file?: File | Blob;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const formatSeconds = (secs: number) => {
  if (!isFinite(secs) || isNaN(secs) || secs < 0) return "0:00";
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

/** Best-effort MIME type inference from file extension */
const inferMimeType = (name?: string) => {
  const ext = name?.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "aac":
    case "acc":
      return "audio/aac";
    case "m4a":
    case "mp4":
      return "audio/mp4";
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "ogg":
    case "oga":
      return "audio/ogg";
    case "opus":
      return "audio/ogg; codecs=opus";
    case "flac":
      return "audio/flac";
    case "webm":
      return "audio/webm";
    default:
      return "audio/wav";
  }
};

/** Programmatically creates a lightweight synthetic audio blob URL as zero-dependency fallback */
function createSyntheticAudioBlobUrl(durationSeconds = 12): string {
  if (typeof window === "undefined") return "";
  try {
    const sampleRate = 22050;
    const numSamples = Math.floor(sampleRate * durationSeconds);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // RIFF identifier
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + numSamples * 2, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"

    // fmt subchunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // 16-bit

    // data subchunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, numSamples * 2, true);

    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;

      // Telephone ring simulation & pleasant chime sequence
      if ((t >= 0.5 && t <= 2.2) || (t >= 3.2 && t <= 4.9)) {
        const ringT = t % 2.7;
        if (ringT < 1.7) {
          const env = Math.sin((Math.PI * ringT) / 1.7);
          sample = 0.22 * env * (Math.sin(2 * Math.PI * 440 * t) + Math.sin(2 * Math.PI * 480 * t));
        }
      } else if (t >= 5.5) {
        const chimeT = t - 5.5;
        const chord =
          Math.sin(2 * Math.PI * 330 * t) * 0.14 +
          Math.sin(2 * Math.PI * 440 * t) * 0.14 +
          Math.sin(2 * Math.PI * 554 * t) * 0.11;
        const decay = Math.exp(-0.45 * (chimeT % 1.6));
        sample = chord * decay * 0.55;
      }

      sample += Math.sin(2 * Math.PI * 100 * t) * 0.01;
      const s = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }

    const blob = new Blob([view], { type: "audio/wav" });
    return URL.createObjectURL(blob);
  } catch {
    return "";
  }
}

const SKIP_SECONDS = 10;
const BAR_COUNT = 56;
const DEFAULT_FALLBACK_AUDIO = "/audio/sample-call.wav";

/* -------------------------------------------------------------------------- */
/*  Main AudioPlayer Component                                                */
/* -------------------------------------------------------------------------- */

export function AudioPlayer({
  src,
  fileName = "Lead_Verification_Call.mp3",
  fileSize,
  durationSeconds = 180,
  onNaturalEnd,
  isCompleted = false,
  requiredForAction,
  disableForwardSeek = false,
  mimeType,
  file,
  className,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const maxReachedRef = useRef(0);
  const onNaturalEndRef = useRef(onNaturalEnd);
  const previousVolumeRef = useRef(1);
  const isFallbackActiveRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [scrubTime, setScrubTime] = useState<number | null>(null);
  const [duration, setDuration] = useState(durationSeconds);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isEndedNaturally, setIsEndedNaturally] = useState(isCompleted);

  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    onNaturalEndRef.current = onNaturalEnd;
  }, [onNaturalEnd]);

  // Handle source resolution and automatic recovery
  useEffect(() => {
    let cancelled = false;
    let createdUrl: string | null = null;

    setResolvedSrc(undefined);
    setHasError(false);
    setErrorMessage(null);
    setIsUsingFallback(false);
    isFallbackActiveRef.current = false;
    setIsPlaying(false);
    setIsBuffering(false);
    setCurrentTime(0);
    setScrubTime(null);
    setDuration(durationSeconds);
    setIsEndedNaturally(isCompleted);
    maxReachedRef.current = 0;

    // 1. Direct file object provided (e.g. from local file input)
    if (file) {
      const name = fileName || (file as File).name;
      const type =
        mimeType || (file.type.startsWith("audio/") ? file.type : inferMimeType(name));
      createdUrl = URL.createObjectURL(
        type && file.type !== type ? new Blob([file], { type }) : file
      );
      setResolvedSrc(createdUrl);
      return () => {
        cancelled = true;
        if (createdUrl) URL.revokeObjectURL(createdUrl);
      };
    }

    // 2. No source provided -> use fallback
    if (!src) {
      const fallbackUrl = DEFAULT_FALLBACK_AUDIO || createSyntheticAudioBlobUrl(12);
      createdUrl = fallbackUrl.startsWith("blob:") ? fallbackUrl : null;
      setResolvedSrc(fallbackUrl);
      setIsUsingFallback(true);
      isFallbackActiveRef.current = true;
      return () => {
        cancelled = true;
        if (createdUrl) URL.revokeObjectURL(createdUrl);
      };
    }

    const type = mimeType || inferMimeType(fileName);

    // 3. Blob or relative / static URL
    if (src.startsWith("blob:") && type) {
      fetch(src)
        .then((res) => res.blob())
        .then((blob) => {
          if (cancelled) return;
          if (blob.type.startsWith("audio/")) {
            setResolvedSrc(src);
          } else {
            createdUrl = URL.createObjectURL(new Blob([blob], { type }));
            setResolvedSrc(createdUrl);
          }
        })
        .catch(() => {
          if (!cancelled) setResolvedSrc(src);
        });
    } else {
      // Validate remote or local source with soft fallback on 404 / network error
      setResolvedSrc(src);

      // Verify if remote URL is reachable without blocking
      if (src.startsWith("http://") || src.startsWith("https://")) {
        fetch(src, { method: "HEAD" })
          .then((res) => {
            if (cancelled) return;
            if (!res.ok && res.status === 404) {
              // Automatically switch to working demo recording
              const fallback = DEFAULT_FALLBACK_AUDIO || createSyntheticAudioBlobUrl(12);
              createdUrl = fallback.startsWith("blob:") ? fallback : null;
              setResolvedSrc(fallback);
              setIsUsingFallback(true);
              isFallbackActiveRef.current = true;
            }
          })
          .catch(() => {
            if (cancelled) return;
            // Network or CORS error on remote URL: provide synthetic fallback
            const fallback = DEFAULT_FALLBACK_AUDIO || createSyntheticAudioBlobUrl(12);
            createdUrl = fallback.startsWith("blob:") ? fallback : null;
            setResolvedSrc(fallback);
            setIsUsingFallback(true);
            isFallbackActiveRef.current = true;
          });
      }
    }

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [src, file, fileName, mimeType, durationSeconds, isCompleted]);

  useEffect(() => {
    if (isCompleted) setIsEndedNaturally(true);
  }, [isCompleted]);

  /* ------------------------- Audio element wiring ------------------------- */

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
      setHasError(false);
      setErrorMessage(null);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsBuffering(true);
    const onReady = () => {
      setIsBuffering(false);
      setHasError(false);
    };

    const onError = () => {
      // If primary source failed and fallback hasn't been activated yet, switch to fallback
      if (!isFallbackActiveRef.current) {
        isFallbackActiveRef.current = true;
        setIsUsingFallback(true);
        const synthUrl = createSyntheticAudioBlobUrl(12);
        setResolvedSrc(synthUrl || DEFAULT_FALLBACK_AUDIO);
        setHasError(false);
        setErrorMessage(null);
        return;
      }

      const code = audio.error?.code;
      setErrorMessage(
        code === 4
          ? "This audio format is not supported by your browser."
          : code === 2
          ? "Network error occurred while loading audio."
          : "Audio file is temporarily unavailable."
      );
      setHasError(true);
      setIsPlaying(false);
      setIsBuffering(false);
    };

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);

    const onEnded = () => {
      setIsPlaying(false);
      const finalDur = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : duration;
      setCurrentTime(finalDur);
      maxReachedRef.current = finalDur;
      setIsEndedNaturally(true);
      onNaturalEndRef.current?.();
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onReady);
    audio.addEventListener("playing", onReady);
    audio.addEventListener("error", onError);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onReady);
      audio.removeEventListener("playing", onReady);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [duration]);

  /* --------------- Smooth progress ticker during playback --------------- */

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isPlaying) return;

    const tick = () => {
      const t = audio.currentTime;
      setCurrentTime(t);
      if (t - maxReachedRef.current < 1.5) {
        maxReachedRef.current = Math.max(maxReachedRef.current, t);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  /* ------------------------------- Controls ------------------------------- */

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
      }
    } else {
      audio.pause();
    }
  }, [hasError]);

  const limitSeek = useCallback(
    (t: number) => {
      const upper = disableForwardSeek ? Math.min(duration, maxReachedRef.current) : duration;
      return clamp(t, 0, upper);
    },
    [disableForwardSeek, duration]
  );

  const seekTo = useCallback(
    (t: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      const target = limitSeek(t);
      audio.currentTime = target;
      setCurrentTime(target);
    },
    [limitSeek]
  );

  const handleRestart = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    try {
      await audio.play();
    } catch {
      setIsPlaying(false);
    }
  }, [hasError]);

  const skipBy = (delta: number) => seekTo((audioRef.current?.currentTime ?? currentTime) + delta);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted || volume === 0) {
      const restored = previousVolumeRef.current > 0 ? previousVolumeRef.current : 0.7;
      audio.muted = false;
      audio.volume = restored;
      setVolume(restored);
      setIsMuted(false);
    } else {
      previousVolumeRef.current = volume;
      audio.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolume = (val: number) => {
    const audio = audioRef.current;
    const v = clamp(val, 0, 1);
    setVolume(v);
    if (v > 0) previousVolumeRef.current = v;
    if (audio) {
      audio.volume = v;
      audio.muted = v === 0;
    }
    setIsMuted(v === 0);
  };

  /* -------------------------------- Derived -------------------------------- */

  const displayTime = scrubTime ?? currentTime;
  const progressPercent = duration > 0 ? clamp((displayTime / duration) * 100, 0, 100) : 0;
  const remainingTime = Math.max(duration - displayTime, 0);
  const effectiveVolume = isMuted ? 0 : volume;

  const VolumeIcon = effectiveVolume === 0 ? VolumeX : effectiveVolume < 0.5 ? Volume1 : Volume2;

  // Deterministic acoustic waveform bars
  const bars = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, i) => {
        const v = Math.abs(Math.sin(i * 0.63) * 0.55 + Math.cos(i * 0.27 + 1.3) * 0.45);
        return 22 + v * 78;
      }),
    []
  );

  const accentFill = isEndedNaturally ? "bg-emerald-500" : "bg-primary";

  const renderBars = (colorClass: string) => (
    <div className="flex h-full w-full items-center gap-[2px]">
      {bars.map((h, i) => (
        <div
          key={i}
          style={{ height: `${h}%` }}
          className={cn("min-w-0 flex-1 rounded-full", colorClass)}
        />
      ))}
    </div>
  );

  /* --------------------------------- Render -------------------------------- */

  return (
    <div
      className={cn(
        "w-full rounded-xl border bg-card p-3.5 shadow-xs transition-colors duration-500",
        isEndedNaturally ? "border-emerald-500/40 bg-emerald-500/5" : "border-border",
        className
      )}
    >
      <audio
        ref={audioRef}
        src={resolvedSrc}
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-300",
              isEndedNaturally
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : isPlaying
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            <FileAudio className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-[14px] font-semibold text-foreground">{fileName}</h4>
            <p className="text-[12.5px] text-muted-foreground tabular-nums font-mono">
              {fileSize ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB` : "Audio stream"}
              <span className="mx-1.5 opacity-50">/</span>
              {formatSeconds(duration)}
              {isUsingFallback && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-primary/80 font-normal">
                  <Radio className="h-2.5 w-2.5 animate-pulse text-emerald-500" />
                  Local Demo Audio
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Status pill */}
        <div className="shrink-0">
          {hasError ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-[11px] font-medium text-destructive">
              <AlertCircle className="h-3 w-3" />
              Unavailable
            </span>
          ) : isEndedNaturally ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </span>
          ) : isPlaying ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
              <span className="flex h-3 items-end gap-[2px]" aria-hidden>
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="w-[2px] animate-pulse rounded-full bg-primary"
                    style={{ height: `${60 + (delay / 300) * 40}%`, animationDelay: `${delay}ms` }}
                  />
                ))}
              </span>
              Playing
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md border border-border bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {currentTime > 0 ? "Paused" : "Ready"}
            </span>
          )}
        </div>
      </div>

      {/* Error explanation if any */}
      {hasError && errorMessage && (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-[12.5px] text-destructive"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="min-w-0">
            {errorMessage}
            <span className="mt-1 block truncate font-mono text-[11px] opacity-70">
              Source: {file ? `uploaded file (${file.type || "no type"})` : src || "none"}
            </span>
          </span>
        </p>
      )}

      {/* Waveform scrubber */}
      <div className="mt-4">
        <Slider
          value={displayTime}
          max={duration}
          step={1}
          ariaLabel="Seek audio position"
          ariaValueText={`${formatSeconds(displayTime)} of ${formatSeconds(duration)}`}
          className="h-14 rounded-lg bg-muted/50 px-2 py-2"
          onChange={(v) => setScrubTime(limitSeek(v))}
          onCommit={(v) => {
            seekTo(v);
            setScrubTime(null);
          }}
        >
          {({ dragging }) => (
            <div className="relative h-full w-full">
              {/* Base layer */}
              {renderBars("bg-muted-foreground/25")}

              {/* Played layer: smoothly clipped */}
              <div
                className="absolute inset-0"
                style={{ clipPath: `inset(0 ${100 - progressPercent}% 0 0)` }}
              >
                {renderBars(accentFill)}
              </div>

              {/* Playhead marker */}
              <div
                className={cn(
                  "pointer-events-none absolute -top-1 -bottom-1 w-[3px] -translate-x-1/2 rounded-full shadow-sm transition-opacity duration-200",
                  isEndedNaturally ? "bg-emerald-500" : "bg-primary",
                  dragging
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                )}
                style={{ left: `${progressPercent}%` }}
              />
            </div>
          )}
        </Slider>

        <div className="mt-2 flex items-center justify-between px-1 text-[13px] tabular-nums font-mono text-muted-foreground">
          <span>{formatSeconds(displayTime)}</span>
          <span>-{formatSeconds(remainingTime)}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="mt-3 flex items-center justify-between gap-3">
        {/* Transport */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRestart}
            disabled={hasError}
            title="Restart"
            aria-label="Restart audio from the beginning"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-90 disabled:pointer-events-none disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => skipBy(-SKIP_SECONDS)}
            disabled={hasError}
            title={`Back ${SKIP_SECONDS} seconds`}
            aria-label={`Skip back ${SKIP_SECONDS} seconds`}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-90 disabled:pointer-events-none disabled:opacity-40"
          >
            <RotateCcw className="h-[18px] w-[18px] -scale-x-100 rotate-180 opacity-0" aria-hidden />
            <span className="absolute text-[11px] font-semibold font-mono tabular-nums">-{SKIP_SECONDS}</span>
          </button>

          <button
            type="button"
            onClick={togglePlay}
            disabled={hasError}
            aria-label={isPlaying ? "Pause audio playback" : "Play audio playback"}
            className={cn(
              "relative mx-1 flex h-11 w-11 items-center justify-center rounded-full shadow-md transition-all duration-300",
              "hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isEndedNaturally && !isPlaying
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
              isPlaying && "shadow-md shadow-primary/30"
            )}
          >
            <Play
              className={cn(
                "absolute h-5 w-5 fill-current transition-all duration-200",
                isPlaying || isBuffering
                  ? "scale-50 opacity-0 -rotate-90"
                  : "scale-100 opacity-100 rotate-0"
              )}
            />
            <Pause
              className={cn(
                "absolute h-5 w-5 fill-current transition-all duration-200",
                isPlaying && !isBuffering
                  ? "scale-100 opacity-100 rotate-0"
                  : "scale-50 opacity-0 rotate-90"
              )}
            />
            <Loader2
              className={cn(
                "absolute h-5 w-5 animate-spin transition-opacity duration-200",
                isBuffering && isPlaying ? "opacity-100" : "opacity-0"
              )}
            />
          </button>

          <button
            type="button"
            onClick={() => skipBy(SKIP_SECONDS)}
            disabled={hasError}
            title={`Forward ${SKIP_SECONDS} seconds`}
            aria-label={`Skip forward ${SKIP_SECONDS} seconds`}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-90 disabled:pointer-events-none disabled:opacity-40"
          >
            <RotateCw className="h-[18px] w-[18px] opacity-0" aria-hidden />
            <span className="absolute text-[11px] font-semibold font-mono tabular-nums">+{SKIP_SECONDS}</span>
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={effectiveVolume === 0 ? "Unmute audio" : "Mute audio"}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-90"
          >
            <VolumeIcon className="h-[18px] w-[18px]" />
          </button>

          <Slider
            value={effectiveVolume}
            max={1}
            step={0.05}
            ariaLabel="Volume"
            ariaValueText={`${Math.round(effectiveVolume * 100)} percent`}
            className="mx-1.5 w-20 py-3 sm:w-24"
            onChange={handleVolume}
          >
            {({ percent, dragging }) => (
              <div className="relative h-1.5 w-full rounded-full bg-muted">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full bg-primary",
                    !dragging && "transition-[width] duration-150 ease-out"
                  )}
                  style={{ width: `${percent}%` }}
                />
                <div
                  className={cn(
                    "pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background shadow transition-transform duration-150",
                    dragging ? "scale-125" : "scale-100 group-hover:scale-110"
                  )}
                  style={{ left: `${percent}%` }}
                />
              </div>
            )}
          </Slider>
        </div>
      </div>

      {/* Compliance / Gating Note */}
      {requiredForAction && (
        <div className="mt-4 border-t border-border/70 pt-3">
          {!isEndedNaturally ? (
            <p className="flex items-center gap-2 text-[13px] font-medium text-amber-600 dark:text-amber-400">
              <span className="inline-block h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-500" />
              Listen to the full recording to enable {requiredForAction}.
            </p>
          ) : (
            <p className="flex items-center gap-2 text-[13px] font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              Recording verified. {requiredForAction} is unlocked.
            </p>
          )}
        </div>
      )}
    </div>
  );
}