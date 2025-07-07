import React, { useEffect, useState } from "react";
import profile from "../../img/Contact.jpg";
import { useInfoContext } from "../../context/Context";
import { getUser } from "../../api/userRequests";
import { useTranslation } from "react-i18next";


const Conversation = ({ chat }) => {
  const { currentUser, exit, onlineUsers, serverUrl } = useInfoContext();

  const [userData, setUserData] = useState(null);

  const userId = chat.members.find((id) => id !== currentUser._id);
  const { t } = useTranslation();
  const online = () => {
    const onlineUser = onlineUsers.find((user) => user.userId === userId);

    return onlineUser ? true : false;
  };

  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data } = await getUser(userId);
        setUserData(data.user);
      } catch (error) {
        if (error.response.data.message === "jwt expired") {
          exit();
        }
      }
    };
    getUserData();
  }, [userId]);
  return (
    <div className="user-info-box">
      <div className={online() ? "online-dot" : "offline-dot "}></div>
      <img
        className="profile-img"
        src={
          userData?.profilePicture
            ? `${serverUrl}/${userData?.profilePicture}`
            : profile
        }
        alt="profile-img"
      />
      <div className="middle-content">
        <h4 className="name">{userData?.firstName}</h4>
        <span className={online() ? "status" : "offline-status"}>
          {online() ? t("onlayn") : t("oflayn")}
        </span>
      </div>
    </div>
  );
};

export default Conversation;