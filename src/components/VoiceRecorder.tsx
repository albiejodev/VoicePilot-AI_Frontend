import { useMicrophone } from "../hooks/useMicrophone";
import { useEffect , useState } from "react";
import { websocketService } from "../services/websocket.service";
import { blobToBase64 } from "../utils/audio";






export const VoiceRecorder = () => {

  const [liveTranscript, setLiveTranscript] = useState("");

  useEffect(() => {
    websocketService.connect("test-session");
  
    const handleAIResponse = (data: any) => {
      console.log("AI Response:", data);
    };
  
    const handleTranscript = (data: any) => {
      setLiveTranscript(data.text);
    };
  
    const handleAudio = async (
      audio: ArrayBuffer
    ) => {
  
      console.log("Playing AI audio...");
  
      const blob = new Blob(
        [audio],
        {
          type: "audio/mpeg",
        }
      );
  
      const url = URL.createObjectURL(blob);
  
      const player = new Audio(url);
  
      player.onended = () => {
        URL.revokeObjectURL(url);
      };
  
      try {
        await player.play();
      } catch (error) {
        console.error("Audio playback failed:", error);
      }
    };
  
    websocketService.on(
      "ai_response",
      handleAIResponse
    );
  
    websocketService.on(
      "transcript",
      handleTranscript
    );
  
    websocketService.on(
      "audio",
      handleAudio
    );
  
    return () => {
  
      websocketService.off(
        "ai_response",
        handleAIResponse
      );
  
      websocketService.off(
        "transcript",
        handleTranscript
      );
  
      websocketService.off(
        "audio",
        handleAudio
      );
  
      websocketService.disconnect();
    };
  
  }, []);



  const handleAudioChunk = async (blob: Blob) => {
    try {
      console.log("Audio chunk generated", blob.size);
      const base64Audio = await blobToBase64(blob);
  
      websocketService.send(
        JSON.stringify({
          type: "audio",
          audio: base64Audio,
        })
      );
    } catch (error) {
      console.error("Failed to process audio chunk", error);
    }
  };
  
  
  const {
    isRecording,
    startRecording,
    stopRecording,
  } = useMicrophone({
    onAudioChunk: handleAudioChunk,
  });



  return (
    <div>

      <h2>VoicePilot AI</h2>

      {!isRecording ? (
        <button onClick={startRecording}>
          Start Recording
        </button>
      ) : (
        <button onClick={stopRecording}>
          Stop Recording
        </button>
      )}

    <p>{liveTranscript}</p>

    </div>
  );
};