
import React from "react";
import { useInfoContext } from "../../context/Context";
import "./User.css";

import message from "../../img/Email.jpg";
import profile from "../../img/Contact.jpg";
import { getUser } from "../../api/userRequests";
import { findChat } from "../../api/chatReauests";
import { useTranslation } from "react-i18next";

export const Users = ({ users }) => {
  const {
    currentUser,
    onlineUsers,
    setUserInfo,
    setOpen,
    exit,
    setCurrentChat,
    setChats,
    chats,
  } = useInfoContext();
  const { t } = useTranslation();

  const online = (userId) => {
    const onlineUser = onlineUsers.find((user) => user.userId === userId);

    return onlineUser ? true : false;
  };

  const getUserData = async (userId) => {
    try {
      const { data } = await getUser(userId);
      setUserInfo(data.user);
    } catch (error) {
      if (error.response.data.message === "jwt expired") {
        exit();
      }
    }
  };

  const createChat = async (firstId, secondId) => {
    try {
      const { data } = await findChat(firstId, secondId);
      setCurrentChat(data.chat);
      if (!chats.some((chat) => chat._id === data.chat._id)) {
        setChats([...chats, data.chat]);
      }
    } catch (error) {
      if (error.response.data.message === "jwt expired") {
        exit();
      }
    }
  };

  return (
    <div className="user-list">
      {users.map((user) => {
        if (user._id !== currentUser._id) {
          return (
            <div key={user._id}>
              <div className="user-info-box">
                <div
                  className={online(user._id) ? "online-dot" : "offline-dot"}
                ></div>
                <img
                  className="profile-img"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    getUserData(user._id);
                    setOpen(true);
                  }}
                  src={
                    user?.profilePicture
                      ? `http://localhost:4002/${user?.profilePicture}`
                      : profile
                  }
                  alt="profile-img"
                />
                <div className="middle-content">
                  <h4 className="name">{user?.firstName}</h4>
                  <span
                    className={online(user._id) ? "status" : "offline-status"}
                  >
                    {online(user._id) ? t("onlayn") : t("oflayn")}
                  </span>
                </div>
                <button
                  onClick={() => {
                    createChat(user._id, currentUser._id);
                  }}
                  className="msg-btn button"
                >
                  <img width={20} src={message} alt="message__icon" />
                </button>
              </div>
            </div>
          );
        }
      })}
    </div>
  );
};
