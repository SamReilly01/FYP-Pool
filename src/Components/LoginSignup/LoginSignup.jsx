import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { registerUser, loginUser } from "../../services/authService";
import "./LoginSignup.css";

const LoginSignup = () => {
    const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
    const [email, setEmail] = useState(""); // Email input
    const [password, setPassword] = useState(""); // Password input 
    const [message, setMessage] = useState(""); // Message to show success or error
    const [messageType, setMessageType] = useState(""); // "success" or "error"
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(""); // Clear any previous messages
    
        try {
            if (isLogin) {
                const response = await loginUser(email, password);
    
                // Save user_id and token in localStorage
                localStorage.setItem("user_id", response.user_id);
                localStorage.setItem("token", response.token);
    
                setMessage("Login successful!");
                setMessageType("success");
    
                console.log("Token:", response.token);
                console.log("User ID:", response.user_id);
    
                // Redirect to the upload page
                navigate("/upload");
            } else {
                const response = await registerUser(email, password);
                setMessage("Registration successful!");
                setMessageType("success");
    
                // Store user_id for registration
                if (response.user_id) {
                    localStorage.setItem("user_id", response.user_id);
                }
            }
    
            // Clear the input fields so nothing saves
            setEmail("");
            setPassword("");
        } catch (err) {
            setMessage(err.error || "Something went wrong.");
            setMessageType("error");
        }
    
        // Automatically clear the message after 4 seconds
        setTimeout(() => {
            setMessage("");
            setMessageType("");
        }, 4000);
    };
    

    return (
        <div className="login-page">
            <div className="container">
                <div className="header">
                    <div className="text">{isLogin ? "Login" : "Sign Up"}</div>
                    <div className="underline"></div>
                </div>

                <form onSubmit={handleSubmit} className="inputs">
                    {/* Email Input */}
                    <div className="input">
                        <img src="/Assets/email.png" alt="email" />
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="input">
                        <img src="/Assets/password.png" alt="password" />
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Forgot Password */}
                    <div className="forgot-password">
                        {isLogin && (
                            <>
                                Forgot your password? <span>Reset here</span>
                            </>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="submit-container">
                        <button type="submit" className="submit-action">
                            {isLogin ? "Login" : "Sign Up"}
                        </button>
                    </div>
                </form>

                {/* Toggle Buttons */}
                <div className="toggle-buttons">
                    <button
                        type="button"
                        className={`submit ${isLogin ? "" : "gray"}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        className={`submit ${!isLogin ? "" : "gray"}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Notification Message */}
                {message && (
                    <div
                        className={`message-container ${
                            messageType === "success" ? "message-success" : "message-error"
                        }`}
                    >
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginSignup;
