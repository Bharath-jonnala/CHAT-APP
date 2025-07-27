import React, { useContext, useEffect, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { upload } from "../../lib/Upload";
const ChatBox = () => {
  const {
    userdata,
    messagesId,
    chatUser,
    messages,
    setMessages,
    chatVisible,
    setChatVisible,
  } = useContext(AppContext);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        // 1. Add the message to the messages/:messagesId document
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userdata.id,
            text: input,
            createdAt: new Date(),
          }),
        });

        // 2. Update both users' chat metadata
        const userIDs = [chatUser.rId, userdata.id];

        for (const id of userIDs) {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const chatData = userChatsSnapshot.data();
            const chatIndex = chatData.chatsData.findIndex(
              (c) => c.messagesId === messagesId
            );

            if (chatIndex !== -1) {
              // Update message metadata
              chatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
              chatData.chatsData[chatIndex].updatedAt = Date.now();

              if (chatData.chatsData[chatIndex].rId === userdata.id) {
                chatData.chatsData[chatIndex].messageSeen = false;
              }

              await updateDoc(userChatsRef, {
                chatsData: chatData.chatsData,
              });
            } else {
              console.warn(`Chat not found in user ${id}'s chat list.`);
            }
          }
        }

        // 3. Clear the input field after sending
        setInput("");
      }
    } catch (error) {
      console.error("Send message error:", error.message);
      toast.error("Failed to send message");
    }
  };

  const sendImage = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0]);

      if (fileUrl && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userdata.id,

            img: fileUrl,
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser.rId, userdata.id];
        for (const id of userIDs) {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const chatData = userChatsSnapshot.data();
            const chatIndex = chatData.chatsData.findIndex(
              (c) => c.messagesId === messagesId
            );

            if (chatIndex !== -1) {
              chatData.chatsData[chatIndex].lastMessage = "📷 Image";
              chatData.chatsData[chatIndex].updatedAt = Date.now();

              if (chatData.chatsData[chatIndex].rId === userdata.id) {
                chatData.chatsData[chatIndex].messageSeen = false;
              }

              await updateDoc(userChatsRef, {
                chatsData: chatData.chatsData,
              });
            } else {
              console.warn(`Chat not found in user ${id}'s chat list.`);
            }
          }
        }
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Send image error:", error.message);
    }
  };

  const convertTimeStamp = (timestamp) => {
    let date = timestamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    if (hour > 12) {
      return hour - 12 + ":" + minute + "PM";
    } else {
      return hour + ":" + minute + "AM";
    }
  };

  useEffect(() => {
    if (messagesId) {
      console.log("Listening to messagesId:", messagesId);
      const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        setMessages(res.data().messages.reverse());
      });
      return () => {
        unSub();
      };
    }
  }, [messagesId]);

  return chatUser ? (
   <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>

      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p>
          {chatUser.userData.name}
          {Date.now() - chatUser.userData.lastSeen <= 70000 ? (
            <img className="dot" src={assets.green_dot} alt="" />
          ) : null}
        </p>

        <img src={assets.help_icon} className="help" alt="" />
        <img
          src={assets.arrow_icon}
          onClick={() => setChatVisible(false)}
          style={{ width: "24px", height: "24px", cursor: "pointer" }}
          className="arrow"
          alt=""
        />
      </div>
      <div className="chat-msg">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sId === userdata.id ? "s-msg" : "r-msg"}
          >
            {msg.img ? (
              <img className="msg-image" src={msg.img} alt="sent-image" />
            ) : (
              <p className="msg">{msg.text}</p>
            )}
            {console.log("Message:", msg)}

            <div>
              <img
                src={
                  msg.sId === userdata.id
                    ? userdata.avatar
                    : chatUser.userData.avatar
                }
                alt=""
              />
              <p className="pa">{convertTimeStamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="send a meessage"
        />
        <input
          onChange={sendImage}
          type="file"
          id="image"
          accept="image/png, image/jpeg"
          hidden
        />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
      <img src={assets.logo_icon} alt="" />
      <p>Chat any time Anywhere</p>
    </div>
  );
};

export default ChatBox;
