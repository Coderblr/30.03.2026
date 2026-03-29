
"use client";

import { useState } from "react";
import { validation } from "../../utils/validation";

export default function LoginPage({ onLoginSuccess, onNavigate }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [userFocused, setUserFocused] = useState(false);
    const [passFocused, setPassFocused] = useState(false);

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const usernameErr = validation.username(username);
        const passwordErr = validation.password(password);

        setUsernameError(usernameErr);
        setPasswordError(passwordErr);

        if (usernameErr || passwordErr) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/token`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ username, password }),
            });

            let data = {};
            try { data = await response.json(); } catch { /* ignore */ }

            if (!response.ok) throw new Error(data.detail || "Login failed");

            // Cookie is now set — let page.js call /users/me via the proxy
            onLoginSuccess();
            setUsername("");
            setPassword("");
        } catch (err) {
            setError(err.message || "Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            {/* LEFT PANEL */}
            <div style={styles.leftPanel}>
                <div style={styles.leftContent}>
                    <img
                        src="/signin/Welcome Back.svg"
                        alt="Welcome Back"
                        style={styles.welcomeImg}
                    />

                    <img
                        src="/signin/Sign in to access your test data creation platform.svg"
                        alt="Sign in to access your test data creation platform"
                        style={styles.subtitleImg}
                    />

                    <div style={styles.featureLinks}>
                        <span style={styles.featureLink}>Automated CIF Generation</span>
                        <span style={styles.featureLink}>CCOD Account Creation</span>
                        <span style={styles.featureLink}>Deposit Management</span>

                    </div>

                    <button
                        style={styles.backBtn}
                        onClick={() => onNavigate("welcome")}
                    >
                        <img
                            src="/signin/Group 36286.svg"
                            alt="Back to Home"
                            style={styles.welcomeImg}
                        />
                    </button>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div style={styles.rightPanel}>
                <img
                    src="/signin/Mask Group 220.png"
                    alt=""
                    style={styles.rightBg}
                />

                <form onSubmit={handleLogin} style={styles.formCard}>
                    <div style={styles.logoRow}>
                        <img
                            src="/signin/SBI logo Blue.svg"
                            alt="SBI"
                            style={styles.sbiLogo}
                        />
                    </div>

                    <div style={styles.tag}>
                        QA TGEN
                    </div>

                    <div style={styles.tag1}>
                        Sign In to Continue
                    </div>

                    {/* <img
                        src="/signin/Sign In.svg"
                        alt="Sign In"
                        style={styles.signInImg}
                    /> */}

                    {/* <img
                        src="/signin/Enter your credentials to continue.svg"
                        alt="Credentials"
                        style={styles.credentialsImg}
                    /> */}

                    {/* USERNAME */}
                    <div style={styles.fieldGroup}>
                        <img
                            src="/signin/Username.svg"
                            alt="Username"
                            style={styles.fieldLabelImg}
                        />

                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onBlur={() =>
                                setUsernameError(validation.username(username))
                            }
                            onFocus={() => setUserFocused(true)}
                            style={{
                                ...styles.input,
                                borderColor: userFocused
                                    ? "#003478"
                                    : "#b8cfe8",
                            }}
                            required
                        />

                        {usernameError && (
                            <div style={styles.inlineError}>
                                {usernameError}
                            </div>
                        )}
                    </div>

                    {/* PASSWORD */}
                    <div style={styles.fieldGroup}>
                        <img
                            src="/signin/Password.svg"
                            alt="Password"
                            style={styles.fieldLabelImg}
                        />

                        <div style={{ position: "relative" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={() =>
                                    setPasswordError(
                                        validation.password(password)
                                    )
                                }
                                onFocus={() => setPassFocused(true)}
                                style={{
                                    ...styles.input,
                                    borderColor: passFocused
                                        ? "#003478"
                                        : "#b8cfe8",
                                }}
                                required
                            />

                            <span
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                style={styles.eyeIcon}
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </span>
                        </div>

                        {passwordError && (
                            <div style={styles.inlineError}>
                                {passwordError}
                            </div>
                        )}
                    </div>

                    {error && <div style={styles.errorMsg}>{error}</div>}

                    <button
                        type="submit"
                        style={styles.loginBtn}
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>

                    <div style={styles.registerRow}>
                        <img
                            src="/signin/Don’t have an account Click Here to Create Account.svg"
                            alt="Register"
                            style={styles.registerImg}
                            onClick={() => onNavigate("register")}
                        />
                    </div>

                    <div style={styles.developerStrip}>
                        ©2026 Developed & Maintained by IT-QA CoE, GITC, SBI v1.0
                    </div>
                </form>
            </div>

            {/* <div style={styles.bottomImageWrapper}>
                <img
                    src="/signin/Group 6878.svg"
                    alt="Bottom Decoration"
                    style={styles.bottomImage}
                />
            </div> */}
        </div>
    );
}

/* ================E0== STYLES ================== */

const styles = {
    container: {
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        overflow: "hidden",
    },

    leftPanel: {
        // width: "380px",
        backgroundColor: "#f0f5fb",
        display: "flex",
        alignItems: "center",
        padding: "48px 40px",
        flex: "0 0 22%",
        minWidth: "260px",
    },

    leftContent: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },

    welcomeImg: { width: "280px" },
    subtitleImg: { width: "300px" },

    featureLinks: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        marginBottom: "20px",

    },

    featureLink: {
        color: "#00A9E0",
        fontSize: "18px",
        fontWeight: "500",
    },

    backBtn: {
        // padding: "9px 24px",
        // border: "1.5px solid #aac4e0",
        // borderRadius: "20px",
        // background: "white",
        cursor: "pointer",
    },

    rightPanel: {
        flex: 1,
        position: "relative",
        display: "flex",
        alignItems: "center",
        // justifyContent: "flex-end",
        justifyContent: "right",
    },

    rightBg: {
        position: "absolute",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        zIndex: 0,
    },

    // formCard: {
    //     position: "relative",
    //     zIndex: 2,
    //     backgroundColor: "white",
    //     borderRadius: "16px",
    //     padding: "36px 40px",
    //     // width: "450px",
    //     width: "90%",
    //     maxWidth: "550px",
    //     marginRight: "48px",
    //     boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
    //     display: "flex",
    //     flexDirection: "column",
    //     alignItems: "center",
    //     transform: "translateX(120px)",
    // },

    formCard: {
        position: "relative",
        zIndex: 2,
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "36px 40px",
        width: "90%",
        maxWidth: "550px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginRight: "48px"
    },

    logoRow: { marginBottom: "8px" },
    sbiLogo: { height: "52px" },
    signInImg: { width: "120px", marginBottom: "4px" },
    credentialsImg: { width: "230px", marginBottom: "20px" },

    fieldGroup: {
        width: "100%",
        marginBottom: "14px",
    },

    fieldLabelImg: {
        height: "16px",
        marginBottom: "6px",
        display: "block",
    },

    input: {
        width: "100%",
        padding: "10px 14px",
        border: "1.5px solid #b8cfe8",
        borderRadius: "6px",
        fontSize: "14px",
        outline: "none",
    },

    inlineError: {
        fontSize: "12px",
        color: "#b91c1c",
        marginTop: "4px",
    },

    errorMsg: {
        width: "100%",
        backgroundColor: "#fee2e2",
        color: "#991b1b",
        padding: "10px 14px",
        borderRadius: "6px",
        marginBottom: "10px",
        fontSize: "13px",
    },

    loginBtn: {
        width: "100%",
        padding: "12px",
        backgroundColor: "#ffd60a",
        border: "none",
        borderRadius: "8px",
        fontWeight: "700",
        cursor: "pointer",
        marginTop: "6px",
        marginBottom: "14px",
    },

    registerRow: {
        display: "flex",
        justifyContent: "center",
    },

    registerImg: {
        maxWidth: "270px",
        cursor: "pointer",
    },

    eyeIcon: {
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        cursor: "pointer",
    },

    bottomImageWrapper: {
        position: "absolute",
        bottom: "0",
        left: "0",
        // transform: "translateX(-50%)",
        zIndex: 4,
        // PointerEvents: "none",
        width: "100%",
    },

    bottomImage: {
        width: "100vw",
        // maxWidth: "1200px",
        height: "auto",
        display: "block",
    },

    tag: {
        color: "#00B5EF",
        backgroundSize: "cover",
        // fontSize: "13px",
        fontSize: "30px",
        fontWeight: "600",
        letterSpacing: "0.5px",
        // marginBottom: "8px",
    },

    tag1: {
        color: "#5c5c5c",
        backgroundSize: "cover",
        fontFamily: "Roboto",
        // fontSize: "13px",
        fontSize: "14px",
        fontWeight: "700",
        letterSpacing: "0.5px",
        marginBottom: "8px",
    },

    developerStrip: {
        marginTop: "15px",
        padding: "8px",
        width: "100%",
        // backgroundColor: "#f2f2f2",
        textAlign: "center",
        fontSize: "12px",
        color: "#555",
        // borderTop: "1px solid #ddd",
        borderRadius: "10px 10px 10px 10px"
    }
};

