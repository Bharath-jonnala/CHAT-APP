import React, { useContext, useEffect, useState } from "react";
import "./RightSideBar.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";


const RightSideBar = () => {
  const {chatUser,messages}=useContext(AppContext)
 const isOnline = chatUser?.userData?.lastSeen &&
  (Date.now() -
    (typeof chatUser.userData.lastSeen.toMillis === "function"
      ? chatUser.userData.lastSeen.toMillis()
      : chatUser.userData.lastSeen)
  ) <= 70000;

  const { handleLogout } = useContext(AppContext);
  const [msgImage,setMsgImages]=useState([]);


  useEffect(() => {
  if (Array.isArray(messages) && messages.length > 0) {
    const tempVar = messages
      .filter(msg => msg.img)
      .map(msg => msg.img);

    setMsgImages(tempVar);
    
  }
}, [messages]);


  return chatUser ? (
    <div>
      <div className="rs">
        <div className="rs-profile">
          <img src={chatUser.userData.avatar} alt="" />
          <h3>
            {chatUser.userData.name}
            {isOnline && <img src={assets.green_dot} className="dot" alt="online" />}
          </h3>

          <p>{chatUser.userData.bio}</p>
        </div>
        <hr />
        <div className="rs-media">
          <p>media</p>
          <div>
            {msgImage.map((url,index)=>(<img onClick={()=>window.open(url)} key={index} src={url}></img>))}
          </div>
        </div>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  )
  : (
    <div className="rs">
      <button onClick={()=>handleLogout()}>Logout</button>

    </div>
  )
};

export default RightSideBar;
