import React from "react";
import "./Modal.css";
import { useInfoContext } from "../../context/Context";
import profile from "../../img/Contact.jpg";
import cover from "../../img/IMG.jpg";
import { useTranslation } from "react-i18next";

const Modal = () => {
  const { setOpen, userInfo, serverUrl } = useInfoContext();
  const { t } = useTranslation();
  return (
    <div>
      <div className="modal-box">
        <div className="modal-body">
          <div className="modal-header">
            <h2>{t('FOYDALANUVCHI MALUMOTLARI')}</h2>
            <button
              className="btn"
              onClick={() => setOpen(false)}
              type="button"
            >
              &#10005;
            </button>
          </div>
          <div className="modal-content">
            <img
              className="coverPicture"
              src={
                userInfo?.coverPicture
                  ? `${serverUrl}/${userInfo?.coverPicture} `
                  : cover
              }
              alt="coverPicture"
            />
            <img
              className="profile-image"
              src={
                userInfo?.profilePicture
                  ? `${serverUrl}/${userInfo?.profilePicture} `
                  : profile
              }
              alt="rasm"
            />
            <div className="info">
              <h1 className="name-modal">
                {userInfo?.firstName} {userInfo?.lastName}
              </h1>
              <p className="email">Email: {userInfo?.email}</p>
              <p className="about">{t("O'ZINGIZ HAQINGIZDA")}: {userInfo?.about}</p>
              <p className="country"> {t('MAMLAKATINGIZ')}: {userInfo?.country}</p>
              <p className="livesIn">{t('YASHASH JOYINGIZ')}: {userInfo?.livesIn}</p>
              <p className="works-at"> {t('ISHLASH JOYINGIZ')}: {userInfo?.worksAt}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;