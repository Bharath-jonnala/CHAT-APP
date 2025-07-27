import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext=createContext();
const AppContextProvider=(props)=>{

    const navigate = useNavigate();
    const [userdata,setuserdata]=useState(null);
    const [chatdata,setchatdata]=useState(null);
    const [messagesId,setMessagesId]=useState(null);
    const [messages,setMessages]=useState([]);
   const [chatUser, setChatUser] = useState(null); // ✅ correct spelling
    const [chatVisible,setChatVisible]=useState(false);

    const loadUserData=async(uid)=>{
        try {
            const userRef=doc(db,'users',uid);
            const userSnap=await getDoc(userRef);
            const userData=userSnap.data();
            setuserdata(userData);
            if(userData.avatar && userData.name){
                navigate('/chat');
            }
            else{
                navigate('/profile');
            }
            await updateDoc(userRef,{
                lastSeen:Date.now()
            })
          setInterval(() => {
    const updateLastSeen = async () => {
        if(auth.chatUser){
            try {
                await updateDoc(userRef, {
                    lastSeen: Date.now()
                });
            } catch (err) {
                console.error("Error updating last seen:", err);
            }
        }
        };
        updateLastSeen();
    }, 60000);
            } catch (error) {
                console.log(error);
        }
    }



     const resetChatState = () => {
    setuserdata(null);
    setchatdata(null);
    setMessagesId(null);
    setMessages([]);
    setChatUser(null);
  };

   // Logout handler (provided via context)
  const handleLogout = async () => {
    try {
      resetChatState();
      await auth.signOut();
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };



    useEffect(()=>{
        if(userdata){
            const chatRef=doc(db,'chats',userdata.id);
            const unSub=onSnapshot(chatRef,async (res) => {
                const chatItems=res.data().chatsData;
            
                const tempData=[];
                for(const item of chatItems){
                    const userRef=doc(db,'users',item.rId) ;
                    const userSnap=await getDoc(userRef);;
                    const userData=userSnap.data();
                    tempData.push({...item,userData})
                }
                setchatdata(tempData.sort((a, b) => b.updatedAt - a.updatedAt));

            })
            return ()=>{
                unSub();
            }
        }
    },[userdata])



    const value={
        userdata,setuserdata,
        chatdata,setchatdata,
        loadUserData,
        messages,setMessages,
        messagesId,setMessagesId,
        chatUser,setChatUser,handleLogout,
        chatVisible,setChatVisible
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}

        </AppContext.Provider>
    )
}
export default AppContextProvider