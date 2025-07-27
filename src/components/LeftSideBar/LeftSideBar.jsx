import React, { useContext, useEffect, useState } from "react";
import "./LeftSideBar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const LeftSideBar = () => {
  const navigate = useNavigate();
  const {
    userdata,
    chatdata,
    chatUser,
    setChatUser,
    setMessagesId,
    messagesId,
    chatVisible,
    setChatVisible,
  } = useContext(AppContext);

  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.docs[0].id !== userdata.id) {
          let userExist = false;
          chatdata?.forEach((user) => {
            if (user.rId === querySnap.docs[0].data().id) {
              userExist = true;
            }
          });
          if (!userExist) {
            setUser(querySnap.docs[0].data());
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addChat = async () => {
    const messagesRef = collection(db, "messages");
    const chatRef = collection(db, "chats");

    try {
      const chatExists = chatdata?.some((chat) => chat.rId === user.id);
      if (chatExists) {
        toast.info("Chat already exists");
        return;
      }

      const newMessageRef = doc(messagesRef);

      await setDoc(newMessageRef, {
        createAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(chatRef, user.id), {
        chatsData: arrayUnion({
          messagesId: newMessageRef.id,
          lastMessage: "",
          rId: userdata.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });

      await updateDoc(doc(chatRef, userdata.id), {
        chatsData: arrayUnion({
          messagesId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });

      const uSnap = await getDoc(doc(db, "users", user.id));
      const uData = uSnap.data();
      setChat({
        messagesId: newMessageRef.id,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userdata: uData,
      });
      setShowSearch(false);
      setChatVisible(true);
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const setChat = async (item) => {
    setMessagesId(item.messagesId);
    setChatUser(item);

    const userChatsRef = doc(db, "chats", userdata.id);
    const userChatsSnapshot = await getDoc(userChatsRef);
    const userChatsData = userChatsSnapshot.data();
    const chatIndex = userChatsData.chatsData.findIndex(
      (c) => c.messagesId === item.messagesId
    );

    if (chatIndex !== -1) {
      userChatsData.chatsData[chatIndex].messageSeen = true;

      await updateDoc(userChatsRef, {
        chatsData: userChatsData.chatsData, // ✅ Corrected field name
      });
      setChatVisible(true);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (err) {
      toast.error("Logout failed");
      console.error(err);
    }
  };

  useEffect(() => {
    const updateChatUserData = async () => {
      if (chatUser) {
        const userRef = doc(db, "users", chatUser.userdata.id);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        setChatUser((prev) => ({ ...prev, userdata: userData }));
      }
    };
    updateChatUserData();
  }, [chatdata]);

  return (
    <div className={`ls ${chatVisible ? "hidden" : ""}`}>
      <div className="ls-top">
        <div className="ls-nav">
          <img
            src={assets.logo}
            className="logoleftsidebar"
            alt="ChatApp Logo"
          />
          <div className="menu">
            <img src={assets.menu_icon} alt="Menu" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p onClick={handleLogout}>Logout</p>
            </div>
          </div>
        </div>

        <div className="ls-search">
          <img src={assets.search_icon} alt="Search" />
          <input
            onChange={inputHandler}
            type="text"
            placeholder="Search here.."
          />
        </div>
      </div>

      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className="friends add-user">
            <img src={user.avatar || assets.default_avatar} alt="avatar" />
            <p>{user.name}</p>
          </div>
        ) : Array.isArray(chatdata) && chatdata.length > 0 ? (
          [...new Map(chatdata.map((item) => [item.rId, item])).values()].map(
            (item) => (
              <div
                onClick={() => setChat(item)}
                key={item.messagesId}
                className={`friends${
                  item.messageSeen || item.messagesId === messagesId
                    ? ""
                    : " border"
                }`}
              >
                <img
                  src={item.userData.avatar || assets.default_avatar}
                  alt="Profile"
                />
                <div>
                  <p>{item.userData.name}</p>
                  <span>{item.lastMessage}</span>
                </div>
              </div>
            )
          )
        ) : (
          <p>No chats available</p>
        )}
      </div>
    </div>
  );
};

export default LeftSideBar;
