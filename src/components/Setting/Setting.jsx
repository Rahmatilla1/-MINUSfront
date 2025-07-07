import React from "react";
import { useInfoContext } from "../../context/Context";
import profile from "../../img/Contact.jpg";
import cover from "../../img/IMG.jpg";
import "./Settings.css";
import LanguageSelector from "../LanguageSelector "
import { updateUser } from "../../api/userRequests";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const { setSettings, currentUser, setCurrentUser, serverUrl, exit } =
    useInfoContext();
    const { t } = useTranslation();

  const handleForm = async (e) => {
    e.preventDefault();
    try {
      setSettings(true);
      const formData = new FormData(e.target);
      const { data } = await updateUser(currentUser._id, formData);
      setCurrentUser(data?.user);
      localStorage.setItem("profile", JSON.stringify(data?.user));
      setSettings(false);
      toast.success("MUVAFFAQIYATLI YANGILANDI");
    } catch (error) {
      setSettings(false);
      if (error?.response?.data.message === "jwt expired") {
        exit();
      }
    }
  };
  return (
    <div className="modal-box">
      <div className="modal-body">
        <div className="modal-header">
          <h2>{t('YANGILASH')}</h2>
          <button
            className="btn"
            onClick={() => setSettings(false)}
            type="button"
          >
            &#10005;
          </button>
        </div>
        <div className="modal-content">
          <img
            className="coverPicture"
            src={
              currentUser?.coverPicture
                ? `${serverUrl}/${currentUser?.coverPicture} `
                : cover
            }
            alt="coverPicture"
          />
          <img
            className="profile-image"
            src={
              currentUser?.profilePicture
                ? `${serverUrl}/${currentUser?.profilePicture} `
                : profile
            }
            alt="rasm"
          />
          <form onSubmit={handleForm} className="form-settings">
            <input
              type="text"
              name="firstName"
              defaultValue={currentUser?.firstName}
            />
            <input
              type="text"
              name="lastName"
              defaultValue={currentUser?.lastName}
            />
            <input
              type="email"
              name="email"
              defaultValue={currentUser?.email}
            />
            <input
              type="text"
              name="about"
              placeholder={t("O'ZINGIZ HAQINGIZDA")}
              defaultValue={currentUser?.about}
            />
            <input
              type="text"
              name="livesIn"
              placeholder={t("QAYERDA YASHAYSIZ")}
              defaultValue={currentUser?.livesIn}
            />
            <input
              type="text"
              name="country"
              defaultValue={currentUser?.country}
              placeholder={t("QAYERDA TUG'ILGANSIZ")}
            />
            <input
              type="text"
              name="worksAt"
              placeholder={t("NMA ISH QILASIZ")}
              defaultValue={currentUser?.worksAt}
            />
            <input
              type="text"
              name="relationship"
              placeholder={t("OILALIMISIZ")}
              defaultValue={currentUser?.relationship}
            />
            <label htmlFor="profileImg">
              {t('PROFIL RASMI')}
              <input
                id="profileImg"
                type="file"
                style={{ display: "none" }}
                name="profilePicture"
                placeholder="profile Image"
              />
            </label>
            <label htmlFor="coverImg">
              {t('MUQOVA RASMI')}
              <input
                id="coverImg"
                type="file"
                style={{ display: "none" }}
                name="coverPicture"
                placeholder="coverImage"
              />
            </label>
            <button className="setting-button">{t("O'ZGARISHLARNI SAQLANG")}</button>
          </form>
        </div>
      </div>
      <LanguageSelector/>
    </div>
  );
};

export default Settings;