import { useRef, useState } from "react";

interface UseMicrophoneProps {
  onAudioChunk?: (chunk: Blob) => void;
}

export const useMicrophone = ({ onAudioChunk}: UseMicrophoneProps = {}) => {

  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          onAudioChunk?.(event.data);
        }
      };

      recorder.start(250);

      mediaRecorderRef.current = recorder;

      setIsRecording(true);
    } catch (error) {
      console.error(error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();

    streamRef.current?.getTracks().forEach((track) => track.stop());

    setIsRecording(false);
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
};