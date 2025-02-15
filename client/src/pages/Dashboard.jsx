import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import "../styles/Dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import favicon from "../images/favicon32.png";

function Dashboard() {
    const [website, setWebsite] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordList, setPasswordList] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState({});
    const [loadingPasswords, setLoadingPasswords] = useState({});
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (userId) {
            Axios.get(`http://localhost:5001/showpasswords/${userId}`).then(
                (response) => {
                    setPasswordList(response.data);
                }
            );
        } else {
            navigate("/login"); // if user isn't logged in, they can't redirect to dashboard until they login
        }
    }, [refresh]);

    const addPassword = (e) => {
        e.preventDefault();
        const userId = localStorage.getItem("userId");

        Axios.post("http://localhost:5001/addpassword", {
            userId: userId,
            email: email,
            password: password,
            website: website,
        })
            .then(() => {
                setRefresh(!refresh);
            })
            .finally(() => {
                setEmail("");
                setWebsite("");
                setPassword("");
            });
    };

    const deletePassword = (id) => {
        Axios.post("http://localhost:5001/deletepassword", {
            id: id,
        }).then(() => {
            setRefresh(!refresh);
        });
    };

    const updatePassword = (pwd) => {
        const updatedWebsite = document.querySelector(
            `#website-${pwd.id}`
        ).value;
        const updatedEmail = document.querySelector(`#email-${pwd.id}`).value;
        const updatedPassword = document.querySelector(
            `#password-${pwd.id}`
        ).value;

        Axios.post("http://localhost:5001/updatepassword", {
            id: pwd.id,
            website_name: updatedWebsite,
            email: updatedEmail,
            password: updatedPassword,
        }).then(() => {
            setEditingId(null);
            setRefresh(!refresh);
        });
    };

    const decryptPassword = (pwd) => {
        setLoadingPasswords((prev) => ({
            ...prev,
            [pwd.id]: true, // set loading state of password matching the id to true
        }));

        Axios.post("http://localhost:5001/decryptpassword", {
            password: pwd.password,
            iv: pwd.iv,
        })
            .then((response) => {
                setIsPasswordVisible((prev) => ({
                    ...prev,
                    [pwd.id]: response.data, // store decrypted password
                }));

                setLoadingPasswords((prev) => ({
                    ...prev,
                    [pwd.id]: false, // remove loading state
                }));
            })
            .catch(() => {
                setLoadingPasswords((prev) => ({
                    ...prev,
                    [pwd.id]: false, // remove loading state on error
                }));
            });
    };

    const togglePasswordVisibility = (pwd) => {
        if (!isPasswordVisible[pwd.id]) {
            decryptPassword(pwd);
        } else {
            setIsPasswordVisible((prev) => ({
                ...prev,
                [pwd.id]: null, // hide password on second click
            }));
        }
    };

    const handleLogout = () => {
        localStorage.clear(); // clear userId to logout
        navigate("/");
    };

    return (
        <div className="main-container">
            <nav className="sidebar">
                <h1>
                    <img src={favicon} alt="PK" />
                    PassKeep
                </h1>
                <button onClick={() => setIsAdding(!isAdding)}>
                    + Add Password
                </button>
                <p onClick={() => navigate("/")}>Home</p>
                <p>Dashboard</p>
                <p onClick={handleLogout}>Logout</p>
            </nav>

            <div className="content-section">
                {isAdding && (
                    <div className="add-password">
                        <div
                            className="exit-adding"
                            onClick={() => setIsAdding(false)}
                        >
                            <FontAwesomeIcon
                                icon="fa-solid fa-circle-xmark"
                                style={{ height: "32px" }}
                            />
                        </div>
                        <div className="form-container">
                            <h2 style={{ textAlign: "center" }}>
                                Add Password
                            </h2>
                            <form onSubmit={addPassword}>
                                <input
                                    value={website.trimStart()}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    type="text"
                                    required
                                    placeholder="Enter website name"
                                />
                                <input
                                    value={email.trimStart()}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    required
                                    placeholder="Enter your email"
                                />
                                <input
                                    value={password.trimStart()}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    type="password"
                                    required
                                    placeholder="Enter your password"
                                />
                                <button type="submit">Add Password</button>
                            </form>
                        </div>
                    </div>
                )}
                <div className="passwords">
                    <h2 style={{ marginBottom: "5px" }}>Passwords</h2>
                    {passwordList.length === 0 && (
                        <p style={{ marginTop: "20px" }}>No passwords yet.</p>
                    )}
                    {passwordList.length > 0 && (
                        <div
                            className="password-list"
                            style={{ textAlign: "left" }}
                        >
                            {passwordList.map((pwd, key) => (
                                <div key={key} className="password-item">
                                    {editingId === pwd.id ? (
                                        <input
                                            id={`website-${pwd.id}`}
                                            className="website-name"
                                            defaultValue={pwd.website_name}
                                            type="text"
                                            required
                                        />
                                    ) : (
                                        <h3 className="website-name">
                                            {pwd.website_name}
                                        </h3>
                                    )}
                                    <div className="email">
                                        <FontAwesomeIcon icon="fa-solid fa-envelope" />
                                        <div style={{ overflow: "auto" }}>
                                            {editingId === pwd.id ? (
                                                <input
                                                    id={`email-${pwd.id}`}
                                                    defaultValue={pwd.email}
                                                    type="email"
                                                    required
                                                />
                                            ) : (
                                                pwd.email
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        className="password"
                                        onClick={() =>
                                            editingId !== pwd.id &&
                                            togglePasswordVisibility(pwd)
                                        }
                                    >
                                        <FontAwesomeIcon icon="fa-solid fa-key" />
                                        {editingId === pwd.id ? (
                                            <input
                                                id={`password-${pwd.id}`}
                                                type="password"
                                                defaultValue={
                                                    isPasswordVisible[pwd.id] ||
                                                    pwd.password
                                                }
                                                required
                                            />
                                        ) : loadingPasswords[pwd.id] ? (
                                            <span>Loading...</span>
                                        ) : isPasswordVisible[pwd.id] ? (
                                            isPasswordVisible[pwd.id]
                                        ) : (
                                            "********"
                                        )}
                                    </div>
                                    <div
                                        className="actions"
                                        style={{ textAlign: "left" }}
                                    >
                                        <div
                                            onClick={() =>
                                                deletePassword(pwd.id)
                                            }
                                            className="delete-btn"
                                        >
                                            <FontAwesomeIcon
                                                icon="fa-solid fa-trash"
                                                style={{ height: "20px" }}
                                            />
                                        </div>
                                        <div
                                            onClick={() => {
                                                if (editingId === pwd.id) {
                                                    updatePassword(pwd);
                                                } else {
                                                    setEditingId(pwd.id);
                                                }
                                            }}
                                            className="edit-btn"
                                        >
                                            <FontAwesomeIcon
                                                icon={
                                                    editingId === pwd.id
                                                        ? "fa-solid fa-save"
                                                        : "fa-solid fa-pen-to-square"
                                                }
                                                style={{ height: "20px" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
