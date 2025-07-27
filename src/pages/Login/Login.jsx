import React, { useState, useEffect,  } from 'react';
import assets from '../../assets/assets';
import './Login.css';
import { signup ,login, resetPass } from '../../config/firebase';

const Login = () => {
  const [currState, setCurrState] = useState("Sign up");

  useEffect(() => {
    document.body.classList.add('login-body');
    return () => {
      document.body.classList.remove('login-body');
    };
  }, []);
  const [username,setusername]=useState("");
  const [email,setemail]=useState("");
  const [password,setpassword]=useState("");
  
  const onSubmitHandler=(event)=>{
    event.preventDefault();
    if(currState==="Sign up"){
      signup(username,email,password);
    }
    else{
      login(email,password);
    }
  }

  return (
    <div className='login'>
      <img src={assets.logo_big} alt="" className="logo" />
      <form onSubmit={onSubmitHandler} className="login-form">
        <h2>{currState}</h2>
        {currState === "Sign up" && (
          <input onChange={(e)=>setusername(e.target.value)} value={username} type="text" placeholder="Username" className="form-input" required />
        )}
        <input onChange={(e)=>setemail(e.target.value)} value={email} type="email" placeholder="Email Address" className="form-input" />
        <input onChange={(e)=>setpassword(e.target.value)} value={password} type="password" placeholder="Password" className="form-input" />
        <button type='submit'>
          {currState === "Sign up" ? "Create Account" : "Login Now"}
        </button>
        <div className="login-term">
          <input type="checkbox" />
          <p>Agree to the terms and conditions</p>
        </div>
        <div className="login-forgot">
          {currState === "Sign up" ? (
            <p className="login-toggle">
              Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span>
            </p>
          ) : (
            <p className="login-toggle">
              Create an account <span onClick={() => setCurrState("Sign up")}>Click here</span>
            </p>
          )}
          {
            currState==="Login" ?<p className="login-toggle">
              Forgot password <span onClick={() => resetPass(email)}>Click here</span>
            </p>:null
          }
        </div>
      </form>
    </div>
  );
};

export default Login;
