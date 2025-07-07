import React, { useEffect, useRef, useState } from "react";
import "./ChatBox.css";
import { useInfoContext } from "../../context/Context";
import { getUser } from "../../api/userRequests";
import profile from "../../img/Contact.jpg";
import {
  addMessage,
  getMessages,
  deleteMessage,
  updateMessage,
} from "../../api/messageRequests";
import InputEmoji from "react-input-emoji";
import { toast } from "react-toastify";
import AudioRecorder from "../AudioRecorder";
import VideoMessage from "../VideoMessage";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const ChatBox = ({ setSendMessage, answerMessage, onDeleteMessage, onUpdateMessage}) => {
  const {
    currentUser,
    currentChat,
    exit,
    setOpen,
    setUserInfo,
    serverUrl,
  } = useInfoContext();

  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const [textMessage, setTextMessage] = useState("");
  const { t } = useTranslation();

  const imageRef = useRef();
  const scroll = useRef();

  const userId = currentChat?.members?.find((id) => id !== currentUser._id);

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await getUser(userId);
        setUserData(data.user);
      } catch (error) {
        if (error?.response?.data.message === "jwt expired") exit();
      }
    };
    if (userId) fetchUser();
  }, [userId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await getMessages(currentChat._id);
        setMessages(data.messages);
      } catch (error) {
        if (error?.response?.data.message === "jwt expired") exit();
      }
    };
    if (currentChat) fetchMessages();
  }, [currentChat]);

      useEffect(() => {
  if (!currentChat || !answerMessage || answerMessage.chatId !== currentChat._id) return;

  setMessages((prev) => {
    if (answerMessage.type === "delete") {
      return prev.filter((msg) => msg._id?.toString() !== answerMessage._id?.toString());
    }

    if (answerMessage.type === "update") {
      return prev.map((msg) =>
        msg._id?.toString() === answerMessage._id?.toString()
          ? { ...msg, text: answerMessage.text }
          : msg
      );
    }

    // new message
    const isNew = !prev.some((msg) => msg._id?.toString() === answerMessage._id?.toString());
    if (isNew) return [...prev, answerMessage];

    return prev;
  });
}, [answerMessage, currentChat]);


      const handleSend = async () => {
        const formData = new FormData();
        const createdAt = Date.now();

        const file = imageRef.current.files[0];
        if (!textMessage.trim() && !file) {
          toast.error(t("MATN KIRITILMAGAN"));
          return;
        }

        formData.append("senderId", currentUser._id);
        formData.append("text", textMessage);
        formData.append("chatId", currentChat._id);
        formData.append("createdAt", createdAt);
        if (file) formData.append("file", file);

        const socketPayload = {
          senderId: currentUser._id,
          text: textMessage,
          chatId: currentChat._id,
          createdAt,
          receivedId: userId,
        };

        // ✅ Faqat BIR MARTA emit uchun
        setSendMessage(socketPayload);

        try {
          const { data } = await addMessage(formData);
          setMessages((prev) => [...prev, data.message]);

          // ❌ IKKINCHI SETSENDMESSAGE ni o‘chirdik!
          setTextMessage("");
          imageRef.current.value = null;
        } catch (error) {
          if (error?.response?.data.message === "jwt expired") {
            exit();
          } else {
            toast.error(t("XATOLIK YUZ BERDI"));
          }
        }
      };


  const handleAudioSend = async (file) => {
  const createdAt = Date.now();
  const formData = new FormData();
  formData.append("senderId", currentUser._id);
  formData.append("chatId", currentChat._id);
  formData.append("file", file);
  formData.append("createdAt", createdAt);

  try {
    const { data } = await addMessage(formData);
    setMessages((prev) => [...prev, data.message]);

    // 🔥 audio ni socket orqali yuboramiz (faqat metadata)
    setSendMessage({
      ...data.message,
      receivedId: userId,
    });
  } catch (err) {
    toast.error(t("OVOZLI XABAR YUBORILMADI"));
  }
};

const handleVideoSend = async (file) => {
  const createdAt = Date.now();
  const formData = new FormData();
  formData.append("senderId", currentUser._id);
  formData.append("chatId", currentChat._id);
  formData.append("file", file);
  formData.append("createdAt", createdAt);

  try {
    const { data } = await addMessage(formData);
    setMessages((prev) => [...prev, data.message]);

    // 🔥 video ni socket orqali yuboramiz (faqat metadata)
    setSendMessage({
      ...data.message,
      receivedId: userId,
    });
  } catch (err) {
    toast.error(t("VIDEO YUBORILMADI"));
  }
};


// 2. handleDelete
const handleDelete = async (id) => {
  if (onDeleteMessage) {
    onDeleteMessage(id);
    return;
  }
  try {
    await deleteMessage(id);
    setMessages((prev) => prev.filter((msg) => msg._id !== id));
    toast.success(t("XABAR O‘CHIRILDI"));
    setSendMessage({
      _id: id,
      chatId: currentChat._id,
      type: "delete",
      receivedId: userId,
    });
  } catch (err) {
    toast.error(t("O‘CHIRISHDA XATOLIK"));
  }
};


// 3. handleUpdate
const handleUpdate = async (id) => {
  if (onUpdateMessage) {
    onUpdateMessage(id, editText);
    setIsEditing(null);
    return;
  }

  try {
    const res = await updateMessage(id, { text: editText });
    setMessages((prev) =>
      prev.map((msg) => (msg._id === id ? { ...msg, text: editText } : msg))
    );

    toast.success(t("XABAR YANGILANDI"));
    setIsEditing(null);

    setSendMessage({
      ...res.data.updatedMessage,
      chatId: currentChat._id,
      type: "update",
      receivedId: userId,
    });
  } catch (err) {
    toast.error(t("YANGILASHDA XATOLIK"));
  }
};



  return (
    <div className="chat-box">
      <div className="user-info">
        <img
          className="profile-img"
          onClick={() => {
            setOpen(true);
            setUserInfo(userData);
          }}
          src={userData?.profilePicture ? `${serverUrl}/${userData.profilePicture}` : profile}
          alt="rasm"
        />
        <h3 className="name">
          {userData?.firstName} {userData?.lastName}
        </h3>
      </div>
      <hr />
      <div className="chat-body">
        {messages.map((message) => {
          const isOwnMessage = message.senderId === currentUser._id;
          const fileUrl = message?.file ? `${serverUrl}/${message.file}` : null;

          return (
            <div
              ref={scroll}
              key={message._id}
              className={isOwnMessage ? "message own" : "message"}
            >
              {isEditing === message._id ? (
                <>
                  <input
                    className="edit-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <button onClick={() => handleUpdate(message._id)}>✅</button>
                  <button onClick={() => setIsEditing(null)}>❌</button>
                </>
              ) : (
                <>
                  {message.text && <span className="message-text">{message.text}</span>}
                  {fileUrl && message.file !== "undefined" && (
                    {
                      image: <img className="file-message" src={fileUrl} alt="" />,
                      audio: (
                        <audio controls className="file-audio">
                          <source src={fileUrl} type="audio/webm" />
                          {t("SIZNING BARUZERINGIZ OVOZLI XABAR QO‘LLAB-QUVATLAMAYDI.")}
                        </audio>
                      ),
                      video: (
                        <video
                          controls
                          className="file-video"
                          style={{
                            width: "200px",
                            height: "200px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            boxShadow: "0 0 8px rgba(0,0,0,0.4)",
                            backgroundColor: "black",
                          }}
                        >
                          <source src={fileUrl} type="video/webm" />
                          {t("SIZNING BARUZERINGIZ VIDEO FORMATNI QO‘LLAB-QUVATLAMAYDI.")}
                        </video>
                      ),
                    }[message.type] || <span style={{ color: "red" }}>{t("NOMAʼLUM FORMAT")}</span>
                  )}

                  <span className="message-date">
                    {dayjs(message.createdAt).format("DD.MM.YYYY HH:mm")}
                  </span>

                  {isOwnMessage && (
                    <div className="message-actions">
                      <i
                        onClick={() => handleDelete(message._id)}
                        className="fa-solid fa-trash-can"
                      ></i>
                      <i
                        onClick={() => {
                          setIsEditing(message._id);
                          setEditText(message.text);
                        }}
                        className="fa-solid fa-pen-clip"
                      ></i>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="chat-sender">
        <div
          onClick={() => imageRef.current?.click()}
          className="sender-file-btn button fa-solid fa-file"
        ></div>
        <InputEmoji
          placeholder={t("XABAR YOZING")}
          keepOpened
          value={textMessage}
          onChange={setTextMessage}
        />
        <button
          onClick={handleSend}
          className="send-btn button fa-solid fa-paper-plane"
        ></button>
        <input
          ref={imageRef}
          name="file"
          type="file"
          className="message-file-input"
          accept="image/*,video/mp4,video/webm"
        />

        <AudioRecorder onSend={handleAudioSend} />
        <VideoMessage onSend={handleVideoSend} />
      </div>
    </div>
  );
};

export default ChatBox;