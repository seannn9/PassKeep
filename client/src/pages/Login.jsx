import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Axios from "axios";
import "../styles/Login.css";
import heroImg from "../images/hero.jpg";

export default function Login() {
    const [loginState, setLoginState] = useState("Login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const changeLoginState = () => {
        setEmail("");
        setPassword("");
        setErrorMessage("");
    };

    const register = (e) => {
        e.preventDefault();
        setErrorMessage("");
        Axios.post("http://localhost:5001/register", {
            email: email,
            password: password,
        })
            .then((result) => {
                console.log(result);
                if (result.data === "Account creation success") {
                    navigate("/dashboard");
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 400) {
                    setErrorMessage(
                        "Account already exists. Please login instead."
                    );
                } else {
                    setErrorMessage("An error occured. Please try again.");
                }
            });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setErrorMessage("");
        Axios.post("http://localhost:5001/login", {
            email: email,
            password: password,
        })
            .then((result) => {
                console.log(result);
                if (result.data === "Login success") {
                    navigate("/dashboard");
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 400) {
                    setErrorMessage("Invalid password.");
                } else if (error.response && error.response.status === 404) {
                    setErrorMessage(
                        "Account does not exist. Please sign up first."
                    );
                } else {
                    setErrorMessage("An error occured. Please try again.");
                }
            });
    };

    return (
        <div className="login-container">
            <section className="login-section">
                <div className="form">
                    <div className="label">
                        <h1>
                            <Link to="/">PassKeep</Link> {loginState}
                        </h1>
                        <p>Welcome user! Please enter your details.</p>
                    </div>
                    <form action="">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value.trim())}
                            required
                        />
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            value={password.trim()}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {errorMessage && (
                            <p style={{ color: "red", marginBottom: "10px" }}>
                                {errorMessage}
                            </p>
                        )}

                        {loginState === "Login" ? (
                            <>
                                <button
                                    onClick={handleLogin}
                                    type="submit"
                                    className="sigin-btn"
                                >
                                    Sign In
                                </button>
                                <p>
                                    Don't have an account?{" "}
                                    <span
                                        onClick={() => {
                                            setLoginState("Register");
                                            changeLoginState();
                                        }}
                                    >
                                        Sign up for free!
                                    </span>
                                </p>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={register}
                                    type="submit"
                                    className="sigin-btn"
                                >
                                    Sign Up
                                </button>
                                <p>
                                    Already have an account?{" "}
                                    <span
                                        onClick={() => {
                                            setLoginState("Login");
                                            changeLoginState();
                                        }}
                                    >
                                        Login now!
                                    </span>
                                </p>
                            </>
                        )}
                    </form>
                </div>
            </section>
            <section className="heroimg-section">
                <img src={heroImg} alt="hero image" />
            </section>
        </div>
    );
}
