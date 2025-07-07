import React, { useRef, useState } from "react";

const VideoMessage = ({ onSend }) => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);
  const streamRef = useRef(null);
  const isCancelled = useRef(false);
  const videoRef = useRef(null); // 🆕

const handleStart = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  streamRef.current = stream;

  // ⏯ Oldindan yuzni ko‘rsatish (100ms delay bilan)
  setTimeout(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, 100); // 🔧 Bu joy preview uchun kechiktirish

  mediaRecorderRef.current = new MediaRecorder(stream);
  chunks.current = [];
  isCancelled.current = false;

  mediaRecorderRef.current.ondataavailable = (e) => {
    chunks.current.push(e.data);
  };

  mediaRecorderRef.current.onstop = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());

    // 🎥 Preview tozalash
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (isCancelled.current) {
      chunks.current = [];
      return;
    }

    const blob = new Blob(chunks.current, { type: "video/webm" });
    if (blob.size === 0) return;

    const file = new File([blob], "video-bubble.webm", { type: "video/webm" });
    onSend(file);
  };

  mediaRecorderRef.current.start();
  setRecording(true);
};

  const handleStop = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleCancel = () => {
    isCancelled.current = true;
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="video-recorder" style={{position: "relative"}}>
      {recording && (
                <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="video-preview"
          style={{
            position: "absolute",
            bottom: "60px",
            transform: "translateX(-50%)",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            zIndex: 10,
            backgroundColor: "black",
          }}
        />

      )}

      {!recording ? (
        <button onClick={handleStart}>🎥</button>
      ) : (
        <>
          <button onClick={handleStop}><i style={{color: "#33e050"}} className="fa-solid fa-paper-plane"></i></button>
          <button onClick={handleCancel}><i className="fa-solid fa-trash"></i></button>
        </>
      )}
    </div>
  );
};

export default VideoMessage;