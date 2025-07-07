
import React, { useEffect, useState } from "react";
import { useInfoContext } from "../../context/Context";
import "./Search.css";
import Logo from "../../img/images.png";
import { getAllUsers } from "../../api/userRequests";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Users } from "../User/User";

export const Search = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
const { setSelectedChat, setCurrentChat } = useInfoContext(); // ✅ Ikkalasini olish

  // getAllUsers
  useEffect(() => {
    const getUsers = async () => {
      try {
        toast.loading(t("ILTIMOS KUTING..."));
        const res = await getAllUsers();
        toast.dismiss();
        setUsers(res.data.users);
      } catch (error) {
        toast.dismiss();
        toast.error(error?.response?.data.message);
      }
    };

    getUsers();
  }, [loading]);

  // Search user
const searchUser = (e) => {
  const input = e.target.value.toLowerCase();
  if (input) {
    const result = users.filter((user) => {
      const first = user.firstName?.toLowerCase() || "";
      const last = user.lastName?.toLowerCase() || "";
      const full = `${first} ${last}`;

      return (
        full.includes(input) ||
        first.startsWith(input) ||
        last.startsWith(input)
      );
    });

    setUsers(result);
  } else {
    setLoading(!loading); // Bu joyda avvalgi users ro'yxatini qaytaring yoki default holatga olib keling
  }
};

const handleCloseChat = () => {
  setSelectedChat(null);   // modal / user selection
  setCurrentChat(null);    // chat o‘chirish
};

 


  return (
    <div className="search-user">
      <div className="search-box">
        <img width={40} src={Logo} onClick={handleCloseChat} alt="go-home"/>
        <div className="search-input-box">
          <input
            onChange={searchUser}
            type="text"
            className="search-input"
            placeholder={t("QIDIRISH")}
            name="name"
          />
          <i class="fa-solid fa-magnifying-glass search-img"></i>
        </div>
      </div>
      <h1>{t('HAMMA ODAMLAR')}</h1>
      <Users users={users} />
    </div>
  );
};
