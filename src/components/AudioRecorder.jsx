import React, { useState, useRef } from "react";

const AudioRecorder = ({ onSend }) => {
  const [recording, setRecording] = useState(false);
  const [finishedRecording, setFinishedRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const recordedBlob = useRef(null);
  const streamRef = useRef(null); // 🆕 Streamni saqlaymiz

  const handleStart = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream; // 🆕

    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunks.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      stopTracks(); // 🆕 Mikrofonni to‘xtatish
      recordedBlob.current = new Blob(audioChunks.current, { type: "audio/webm" });
      setFinishedRecording(true); // yozib bo‘ldi
    };

    mediaRecorderRef.current.start();
    setRecording(true);
    setFinishedRecording(false);
  };

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const handleStop = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleCancel = () => {
    recordedBlob.current = null;
    setFinishedRecording(false);
    stopTracks(); // 🆕 Bekor qilishda ham mikrofon to‘xtaydi
  };

  const handleSendAudio = () => {
    if (!recordedBlob.current || recordedBlob.current.size === 0) return;

    const file = new File([recordedBlob.current], "audio-message.webm", {
      type: "audio/webm",
    });
    onSend(file); // Parentga yuborish
    recordedBlob.current = null;
    setFinishedRecording(false);
  };

  return (
    <div className="audio-recorder">
      {!recording && !finishedRecording && (
        <button onClick={handleStart}>
          <i className="fa-solid fa-microphone"></i>
        </button>
      )}

      {recording && (
        <button onClick={handleStop}>
          <i className="fa-solid fa-stop"></i>
        </button>
      )}

      {!recording && finishedRecording && (
        <div>
          <button onClick={handleCancel}>
            <i className="fa-solid fa-trash"></i>
          </button>
          <button onClick={handleSendAudio}>
            <i style={{ color: "#33e050" }} className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;