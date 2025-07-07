import React, { useState } from "react";
import "./Auth.css";

import Logo from "../../img/images.png";
import { register, login } from "../../api/authRequests";
import { useInfoContext } from "../../context/Context";

import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const Auth = () => {
  const [isSignup, setIsSignup] = useState(true);
  const { setCurrentUser } = useInfoContext();
  const [loading, setLoading] = useState(true);
  const [confirmPass, setConfirmPass] = useState(true);
  const { t } = useTranslation();


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      toast.loading("Please wait...");
      const formData = new FormData(e.target);
      setLoading(true);

      let res;
      if (!isSignup) {
        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");

        if (password === confirmPassword) {
          toast.loading("ILTIMOS KUTING...");
          setConfirmPass(true);
          res = await register(formData);
        } else {
          toast.dismiss();
          return setConfirmPass(false);
        }
      } else {
        res = await login(formData);
      }
      toast.dismiss();
      setLoading(false);
      localStorage.setItem("profile", JSON.stringify(res.data.user));
      localStorage.setItem("token", JSON.stringify(res.data.token));
      setCurrentUser(res.data.user);
    } catch (error) {
      toast.dismiss();
      setLoading(false);
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  return (
    <div className="auth">
      <div className="auth-left">
        <img src={Logo} alt="logo" className="logo-img" />
        <div className="app-name">
          <h1 className="cssanimation leBlurInLeft sequence">{t('-MINUS')}</h1>
          <h6 className=" cssanimation leBlurInLeft sequence">
            {t('YAHSHI CHAT TILLAYMAN -')}
          </h6>
        </div>
      </div>
      <div className="auth-right">
        <form
          onSubmit={handleSubmit}
          action=""
          className="auth-form cssanimation blurInLeft"
        >
          <h3>{isSignup ? t("KIRISH") : t("RO'YXATDAN O'TISH")}</h3>

          {!isSignup && (
            <>
              <div>
                <input
                  type="text"
                  name="firstName"
                  className="info-input"
                  placeholder={t("ISMINGIZ")}
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  name="lastName"
                  className="info-input"
                  placeholder={t("FAMILANGIZ")}
                  required
                />
              </div>
            </>
          )}
          <div>
            <input
              type="email"
              name="email"
              className="info-input"
              placeholder={t("EMAIL KIRITING")}
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              className="info-input"
              placeholder={t("PAROL KIRITING")}
              required
            />
          </div>
          {!isSignup && (
            <div>
              <input
                type="password"
                name="confirmPassword"
                className={
                  !confirmPass
                    ? "info-input outline-danger cssanimation danceMiddle"
                    : "info-input"
                }
                placeholder={t("PAROLNI TASDIQLANG")}
                required
              />
            </div>
          )}

          {!confirmPass && (
            <span className="confirm-span">{t('*TASDIQLASH PAROLI BIR XIL EMAS')}</span>
          )}

          <div>
            <span
              onClick={() => {
                setIsSignup(!isSignup);
                setConfirmPass(true);
              }}
              className="info-span"
            >
              {!isSignup
                ? t("BUNDAY ACCOUNT RO'YXATDAN O'TIB BO'LGAN LOGIN")
                : t("SIZNING ACCOUNTINGIZ YO'Q BO'LSA SIGNUP")}
            </span>
            <button className="info-btn button" disabled={!loading}>
              {isSignup ? t("KIRISH") : t("RO'YXATDAN O'TISH")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;