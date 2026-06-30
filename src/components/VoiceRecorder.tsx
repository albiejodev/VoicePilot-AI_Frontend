import { useMicrophone } from "../hooks/useMicrophone";
import { useEffect, useRef, useState } from "react";
import { websocketService } from "../services/websocket.service";
import { blobToBase64 } from "../utils/audio";
import { COLORS } from "../utils/constants";
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from "../utils/constants";

export const VoiceRecorder = () => {
  const [liveTranscript, setLiveTranscript] = useState("");
  const [messages, setMessages] = useState<
    {
      role: "user" | "assistant";
      text: string;
      time: string;
    }[]
  >([]);
  const [appointment, setAppointment] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("connected");
  const [assistantState, setAssistantState] = useState<
    "ready" | "listening" | "thinking" | "speaking"
  >("ready");
  const [callSeconds, setCallSeconds] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  const timestamp = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    websocketService.connect("test-session");

    const handleAIResponse = (data: any) => {
      console.log("AI Response:", data);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);

      if (data.tool_result) {
        setAppointment(data.tool_result);
      }
    };

    const handleTranscript = (data: any) => {
      setLiveTranscript(data.text);

      if (data.is_final) {
        setMessages((prev) => [
          ...prev,
          {
            role: "user",
            text: data.text,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }
    };

    const handleAudio = async (audio: ArrayBuffer) => {
      console.log("Playing AI audio...");

      const blob = new Blob([audio], { type: "audio/mpeg" });
      setAssistantState("speaking");
      const url = URL.createObjectURL(blob);
      const player = new Audio(url);

      player.onended = () => {
        URL.revokeObjectURL(url);

        setAssistantState("ready");

        setLiveTranscript("");
      };

      try {
        await player.play();
      } catch (error) {
        console.error("Audio playback failed:", error);
      }
    };

    websocketService.on("ai_response", handleAIResponse);
    websocketService.on("transcript", handleTranscript);
    websocketService.on("audio", handleAudio);

    return () => {
      websocketService.off("ai_response", handleAIResponse);
      websocketService.off("transcript", handleTranscript);
      websocketService.off("audio", handleAudio);
      websocketService.disconnect();
      setConnectionStatus("disconnected");
    };
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAudioChunk = async (blob: Blob) => {
    try {
      console.log("Audio chunk generated", blob.size);
      const base64Audio = await blobToBase64(blob);

      websocketService.send(
        JSON.stringify({
          type: "audio",
          audio: base64Audio,
        }),
      );
    } catch (error) {
      console.error("Failed to process audio chunk", error);
    }
  };

  const { isRecording, startRecording, stopRecording } = useMicrophone({
    onAudioChunk: handleAudioChunk,
  });

  const handleStart = () => {
    setCallSeconds(0);

    setAssistantState("listening");

    startRecording();
  };

  const handleStop = () => {
    setAssistantState("thinking");

    stopRecording();
  };

  // Call timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setCallSeconds((s) => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const animateWave =
    assistantState === "listening" || assistantState === "speaking";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(45,217,196,0.05), transparent 55%)",
        display: "flex",
        justifyContent: "center",
        padding: "56px 24px",
        color: COLORS.textPrimary,
        fontFamily: FONT_BODY,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(45, 217, 196, 0.45); }
          70% { box-shadow: 0 0 0 18px rgba(45, 217, 196, 0); }
          100% { box-shadow: 0 0 0 0 rgba(45, 217, 196, 0); }
        }
        @keyframes pulseRingDanger {
          0% { box-shadow: 0 0 0 0 rgba(255, 90, 110, 0.45); }
          70% { box-shadow: 0 0 0 18px rgba(255, 90, 110, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 90, 110, 0); }
        }
        @keyframes wave {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
        @keyframes dotBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .vp-bar {
          width: 3px;
          border-radius: 2px;
          background: ${COLORS.accent};
          animation: wave 1s ease-in-out infinite;
        }
        .vp-msg { animation: fadeUp 0.25s ease-out; }
        .vp-btn-primary:hover { filter: brightness(1.08); }
        .vp-btn-primary:active { transform: scale(0.98); }
        .vp-scroll::-webkit-scrollbar { width: 6px; }
        .vp-scroll::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 8px; }
      `}</style>

      <div style={{ width: "100%", maxWidth: "760px" }}>
        {/* ---------------------------------------------------------------- */}
        {/* Header */}
        {/* ---------------------------------------------------------------- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "36px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: COLORS.accentDim,
                border: `1px solid rgba(45,217,196,0.3)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              📞
            </div>
            <div>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 600,
                  fontSize: "19px",
                  letterSpacing: "-0.01em",
                }}
              >
                VoicePilot
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: COLORS.textMuted,
                  fontFamily: FONT_MONO,
                  marginTop: "1px",
                }}
              >
                AI Receptionist · Demo Console
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "7px 12px",
              borderRadius: "20px",
              background: COLORS.bgPanel,
              border: `1px solid ${COLORS.border}`,
              fontSize: "12px",
              fontFamily: FONT_MONO,
              color: COLORS.textSecondary,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background:
                  connectionStatus === "connected"
                    ? COLORS.accent
                    : COLORS.amber,
                animation:
                  connectionStatus === "connected"
                    ? "dotBlink 2s ease-in-out infinite"
                    : "none",
                display: "inline-block",
              }}
            />
            {connectionStatus === "connected"
              ? "session active"
              : connectionStatus}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Call card */}
        {/* ---------------------------------------------------------------- */}
        <div
          style={{
            background: COLORS.bgPanel,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "20px",
            padding: "40px 32px",
            marginBottom: "20px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Avatar / pulse ring */}
          <div
            style={{
              width: "84px",
              height: "84px",
              borderRadius: "50%",
              margin: "0 auto 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isRecording ? COLORS.dangerDim : COLORS.accentDim,
              border: `1.5px solid ${isRecording ? "rgba(255,90,110,0.4)" : "rgba(45,217,196,0.4)"}`,
              animation: isRecording
                ? "pulseRingDanger 1.8s ease-out infinite"
                : "pulseRing 2.4s ease-out infinite",
              fontSize: "30px",
            }}
          >
            {isRecording ? "🎙️" : "🤖"}
          </div>

          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "16px",
              fontWeight: 600,
              marginBottom: "4px",
            }}
          >
            {assistantState === "listening"
              ? "🎤 Listening..."
              : assistantState === "thinking"
                ? "🧠 Thinking..."
                : assistantState === "speaking"
                  ? "🔊 Speaking..."
                  : "🟢 Ready"}
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: "13px",
              color: COLORS.textMuted,
              marginBottom: "22px",
            }}
          >
            {isRecording ? formatTime(callSeconds) : "00:00"}
          </div>

          {/* Waveform */}
          <div
            style={{
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              marginBottom: "26px",
            }}
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="vp-bar"
                style={{
                  height: animateWave ? `${10 + ((i * 37) % 18)}px` : "4px",
                  animationDelay: `${i * 0.05}s`,
                  opacity: animateWave ? 1 : 0.25,
                  background: animateWave ? COLORS.accent : COLORS.textMuted,
                }}
              />
            ))}
          </div>

          {!isRecording ? (
            <button
              className="vp-btn-primary"
              onClick={handleStart}
              style={{
                background: COLORS.accent,
                color: "#06231F",
                border: "none",
                borderRadius: "12px",
                padding: "14px 34px",
                fontSize: "14.5px",
                fontWeight: 600,
                fontFamily: FONT_BODY,
                cursor: "pointer",
                transition: "filter 0.15s ease, transform 0.1s ease",
                boxShadow: "0 8px 24px rgba(45,217,196,0.18)",
              }}
            >
              Start Call
            </button>
          ) : (
            <button
              className="vp-btn-primary"
              onClick={handleStop}
              style={{
                background: COLORS.danger,
                color: "#2A0A10",
                border: "none",
                borderRadius: "12px",
                padding: "14px 34px",
                fontSize: "14.5px",
                fontWeight: 600,
                fontFamily: FONT_BODY,
                cursor: "pointer",
                transition: "filter 0.15s ease, transform 0.1s ease",
                boxShadow: "0 8px 24px rgba(255,90,110,0.18)",
              }}
            >
              End Call
            </button>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Live transcript */}
        {/* ---------------------------------------------------------------- */}
        <div
          style={{
            background: COLORS.bgPanel,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "16px",
            padding: "18px 22px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: "11px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: COLORS.textMuted,
              }}
            >
              Live Transcript
            </span>
            {isRecording && (
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: COLORS.accent,
                  animation: "dotBlink 1.2s ease-in-out infinite",
                }}
              />
            )}
          </div>
          <p
            style={{
              color: liveTranscript ? COLORS.textPrimary : COLORS.textMuted,
              fontSize: "14.5px",
              minHeight: "22px",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {liveTranscript || "Waiting for speech…"}
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Conversation */}
        {/* ---------------------------------------------------------------- */}
        <div
          style={{
            background: COLORS.bgPanel,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "16px",
            padding: "22px",
            height: "400px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: COLORS.textMuted,
              marginBottom: "16px",
            }}
          >
            Conversation
          </div>

          <div
            className="vp-scroll"
            style={{
              maxHeight: "420px",
              overflowY: "auto",
              paddingRight: "4px",
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 0",
                  color: COLORS.textMuted,
                  fontSize: "13.5px",
                }}
              >
                Calls and appointment requests will appear here once a session
                starts.
              </div>
            )}

            {messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={index}
                  className="vp-msg"
                  style={{
                    marginBottom: "14px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "78%",
                      background: isUser ? COLORS.userBubble : COLORS.aiBubble,
                      border: `1px solid ${isUser ? COLORS.userBubbleBorder : COLORS.aiBubbleBorder}`,
                      padding: "12px 15px",
                      borderRadius: isUser
                        ? "14px 14px 4px 14px"
                        : "14px 14px 14px 4px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        fontFamily: FONT_MONO,
                        color: isUser ? "#7FD8C9" : COLORS.textMuted,
                        marginBottom: "5px",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {isUser ? "CALLER" : "VOICEPILOT"}
                    </div>
                    <div style={{ fontSize: "14px", lineHeight: 1.5 }}>
                      {message.text}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "10.5px",
                      color: COLORS.textMuted,
                      fontFamily: FONT_MONO,
                      marginTop: "4px",
                      padding: "0 4px",
                    }}
                  >
                    {message.time}
                  </div>
                </div>
              );
            })}
            <div ref={transcriptEndRef} />
          </div>
        </div>

        {appointment && (
          <div
            style={{
              background: "#102A1F",
              border: "1px solid #10B981",
              borderRadius: "16px",
              padding: "24px",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "16px",
                color: "#10B981",
              }}
            >
              ✅ Appointment Confirmed
            </div>

            <div style={{ marginBottom: "10px" }}>
              <strong>Customer</strong>
              <br />
              {appointment.customer_name}
            </div>

            <div style={{ marginBottom: "10px" }}>
              <strong>Date</strong>
              <br />
              {new Date(appointment.date).toLocaleDateString()}
            </div>

            <div style={{ marginBottom: "10px" }}>
              <strong>Time</strong>
              <br />
              {appointment.time.slice(0, 5)}
            </div>

            <div
              style={{
                marginTop: "18px",
                color: "#34D399",
                fontWeight: 600,
              }}
            >
              📅 Synced to Google Calendar
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "28px",
            fontSize: "11.5px",
            color: COLORS.textMuted,
            fontFamily: FONT_MONO,
          }}
        >
          Gemini · Deepgram · ElevenLabs — local demo session
        </div>
      </div>
    </div>
  );
};
