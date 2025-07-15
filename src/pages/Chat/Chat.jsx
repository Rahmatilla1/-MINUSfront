import React, { useState, useEffect } from "react";
import "./Chat.css";
import { io } from "socket.io-client";

import { useInfoContext } from "../../context/Context";
import { Search } from "../../components/Search/Search";
import { getUserChats } from "../../api/chatReauests";
import Conversation from "../../components/Conversation/Conversation";
import ChatBox from "../../components/ChatBox/ChatBox";
import Modal from "../../components/Modal/Modal";
import chatImg from "../../img/chat.jpg";
import Settings from "../../components/Setting/Setting";
import { useTranslation } from "react-i18next";
import { deleteMessage, updateMessage } from "../../api/messageRequests";
import { toast } from "react-toastify";

// 🔗 Socket ulanish (bitta marta)
const socket = io("http://localhost:4002/");

const Chat = () => {
  const {
    exit,
    currentUser,
    chats,
    setChats,
    setCurrentChat,
    setOnlineUsers,
    open,
    currentChat,
    settings,
    setSettings,
  } = useInfoContext();

  const [sendMessage, setSendMessage] = useState(null);
  const [answerMessage, setAnswerMessage] = useState(null);
  const { t } = useTranslation();

  // 🔄 Chatlar ro‘yxatini olish
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await getUserChats();
        setChats(res.data.chats);
      } catch (error) {
        if (error?.response?.data.message === "jwt expired") {
          exit();
        }
      }
    };

    fetchChats();
  }, [currentUser._id, exit, setChats]);

  // 🌐 Socket orqali yangi foydalanuvchini ulash
  useEffect(() => {
    socket.emit("new-user-added", currentUser._id);

    const handleUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on("get-users", handleUsers);

    return () => {
      socket.off("get-users", handleUsers);
    };
  }, [currentUser._id, setOnlineUsers]);

  // ✉️ Yangi xabar yuborilganda socket orqali jo‘natish
  useEffect(() => {
    if (sendMessage) {
      socket.emit("send-message", sendMessage);
    }
  }, [sendMessage]);

  // 📥 Serverdan kelgan yangi xabarni olish
useEffect(() => {
  const handleAnswer = (data) => {
    if (!currentChat || data.chatId !== currentChat._id) return;

    if (data.type === "delete") {
      // O‘chirilgan xabarni olib tashlash
      setAnswerMessage(data); // Shunchaki trigger
    } else if (data.type === "update") {
      // Tahrirlangan xabarni yangilash
      setAnswerMessage(data); // Shunchaki trigger
    } else {
      // Oddiy yangi xabar
      setAnswerMessage(data);
    }
  };

  socket.on("answer-message", handleAnswer);

  return () => {
    socket.off("answer-message", handleAnswer);
  };
}, [currentChat]);


  // 🗑️ Xabarni o‘chirish
const handleDeleteMessage = async (messageId) => {
  try {
    await deleteMessage(messageId);
    toast.success(t("XABAR O‘CHIRILDI"));

    // 🔁 Real-time uchun socketga signal yuboramiz:
    setSendMessage({
      _id: messageId, // ❗ Bu juda muhim
      chatId: currentChat._id,
      type: "delete",
      receivedId: currentChat.members.find((id) => id !== currentUser._id),
    });

    // 🔄 Lokal holatda ham darhol o‘chirish uchun
    setAnswerMessage({
      _id: messageId,
      chatId: currentChat._id,
      type: "delete",
    });

  } catch (err) {
    toast.error(t("O‘CHIRISHDA XATOLIK"));
    console.error(err);
  }
};



// ✏️ Xabarni tahrirlash
const handleUpdateMessage = async (messageId, newText) => {
  try {
    const res = await updateMessage(messageId, { text: newText });
    toast.success(t("XABAR YANGILANDI"));

    const updated = {
      ...res.data.updatedMessage,
      chatId: currentChat._id,
      type: "update",
      receivedId: currentChat.members.find((id) => id !== currentUser._id),
    };

    // 🔁 Lokal holatda va socket orqali yuborish
    setAnswerMessage(updated);
    setSendMessage(updated);
  } catch (err) {
    toast.error(t("YANGILASHDA XATOLIK"));
    console.error(err);
  }
};




  return (
    <div className="chat-page">
      {/* 🔍 Foydalanuvchi qidiruvi */}
      <div className="left-side cssanimation blurInRight">
        <Search />
      </div>

      {/* 💬 Chat oynasi yoki bo‘sh sahifa */}
      <div className="middle-side cssanimation blurIn">
        {currentChat ? (
          <ChatBox
            setSendMessage={setSendMessage}
            answerMessage={answerMessage}
            onDeleteMessage={handleDeleteMessage}
            onUpdateMessage={handleUpdateMessage}
          />
        ) : (
          <>
            <img
              className="chat-img"
              width={250}
              style={{ borderRadius: "50%" }}
              src={chatImg}
              alt="not found"
            />
            <h2 className="chat-title">{t("HALI CHAT YO'Q")}</h2>
          </>
        )}
      </div>

      {/* 📃 Chatlar ro‘yxati */}
      <div className="right-side cssanimation blurInLeft search-user">
        <div className="right-side-top">
          <h2>{t("BARCHA CHATLAR")}</h2>
          <button onClick={() => setSettings(true)}>
            <span className="fa-solid fa-gear"></span>
          </button>
          <button
            onClick={() => {
              exit();
              socket.emit("exit", currentUser._id);
            }}
          >
            <span className="fa-solid fa-right-from-bracket"></span>
          </button>
        </div>

        <div className="chat-list">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <div
                onClick={() => setCurrentChat(chat)}
                key={chat._id}
                className="chat-item"
              >
                <Conversation chat={chat} />
              </div>
            ))
          ) : (
            <h3>{t("CHAT TOPILMADI!")}</h3>
          )}
        </div>
      </div>

      {open && <Modal />}
      {settings && <Settings />}
    </div>
  );
};

export default Chat;