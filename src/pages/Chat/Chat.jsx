import React, { useContext, useEffect, useState } from 'react';
import './Chat.css';
import LeftSideBar from '../../components/LeftSideBar/LeftSideBar';
import ChatBox from '../../components/ChatBox/ChatBox';
import RightSideBar from '../../components/RightSideBar/RightSideBar';
import { AppContext } from '../../context/AppContext';

const Chat = () => {
  const { chatdata, userdata } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    if(chatdata&&userdata){
      setLoading(false);
    }
  },[chatdata,userdata])
  return (
    <div className="chat">
      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <div className="chat-container">
          <LeftSideBar />
          <ChatBox />
          <RightSideBar />
        </div>
      )}
    </div>
  );
};

export default Chat;