
"use client";

import { useState, useEffect } from "react";
import { Menu, LogOut } from "lucide-react";
import { styles } from "../../styles/AppStyles";

import Sidebar from "./Sidebar";

import { ServiceRegistry } from "../../config/ServiceRegistry";

export default function Dashboard({ user, onLogout, darkMode, onToggleDarkMode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeService, setActiveService] = useState("home");
    const [selectedUser, setSelectedUser] = useState(null);
    const [broadcast, setBroadcast] = useState(null);

    // Listen for system broadcasts
    useEffect(() => {
        const handleMsg = (e) => {
            setBroadcast(e.detail);
            const delay = e.detail.expiry - Date.now();
            if (delay > 0) setTimeout(() => setBroadcast(null), delay);
        };
        window.addEventListener('system-broadcast', handleMsg);
        return () => window.removeEventListener('system-broadcast', handleMsg);
    }, []);


    /**
     * Redirect admin users to Admin Dashboard on first load
     */
    useEffect(() => {
        if ((user?.userType === 1)) {
            setActiveService("admin_dashboard");
        }
    }, [user]);

    // console.log("LOGGED IN USER:", user);

    /**
     * Main content renderer
     */
    const renderContent = () => {
        const Component = ServiceRegistry[activeService];

        // 1. Special Admin Handlers (requires Dashboard state props)
        if (activeService === "user_management") {
            return user?.userType === 1 ? (
                <Component
                    onViewUser={(u) => {
                        setSelectedUser(u);
                        setActiveService("user_detail");
                    }}
                    onViewLogs={(u) => {
                        setSelectedUser(u);
                        setActiveService("activity_logs");
                    }}
                />
            ) : <div style={styles.accessDenied}>Access denied</div>;
        }

        if (activeService === "activity_logs" || activeService === "user_detail") {
            return user?.userType === 1 ? (
                <Component user={selectedUser} onBack={() => setActiveService("user_management")} />
            ) : <div style={styles.accessDenied}>Access denied</div>;
        }

        if (["admin_create_user", "reset_password", "unlock_user"].includes(activeService)) {
            const backRouteMap = {
                admin_create_user: "CreateUser",
                reset_password: "ResetPassword",
                unlock_user: "UnlockUser"
            };
            return user?.userType === 1 ? (
                <Component user={selectedUser} onBack={() => setActiveService(backRouteMap[activeService])} />
            ) : <div style={styles.accessDenied}>Access denied</div>;
        }

        if (activeService === "admin_dashboard") {
            return user?.userType === 1 ? <Component /> : <div style={styles.accessDenied}>Access denied</div>;
        }

        // 2. Generic Service View
        if (Component) return <Component user={user} />;

        // 3. Fallback
        return <ServiceRegistry.home user={user} />;
    };

    return (
        <div style={styles.dashboardContainer}>
            {/* TOP NAV */}
            <nav style={s.dashboardNav}>
                <div style={styles.dashNavLeft}>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={styles.menuBtn}
                    >
                        <Menu size={24} />
                    </button>

                    <div style={styles.navBrand}>
                        {/* <div style={styles.logoCircleSmall}>SBI</div> */}
                        {/* <img src="/dashboard/SBI logo Blue.svg" alt="SBI" style={s.logo} /> */}

                        <img src="/dashboard/logo123.png" alt="SBI" style={s.logo} />
                        {/* <span style={styles.brandTextSmall}>Test Data Platform</span> */}
                    </div>

                    {/* <div style={s.navcenter}>
                        <span style={s.brandTextSmall}>QA TGEN</span>
                    </div> */}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    {user && (
                        <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                            <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--accent-blue)', textTransform: 'capitalize' }}>
                                {user.username || user.firstName || 'User'}
                            </div>
                            <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>
                                {user.department || (user.userType === 1 || user.userType === '1' ? 'Administrator' : 'Standard User')}
                            </div>
                        </div>
                    )}

                    {/* <button
                        onClick={onLogout}
                        style={styles.logoutBtnNav}
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button> */}

                    {/* <button style={s.signoutBtn} onClick={onLogout}>Logout</button> */}

                    <div style={s.logoutWrapper} onClick={onLogout}>
                        <img
                            src="/dashboard/Rectangle 17817.svg"
                            alt="Btn"
                            style={s.yellowBtn}
                        />
                        <img
                            src="/dashboard/Logout.svg"
                            alt="logout"
                            style={s.logoutIcon}
                        />
                    </div>
                </div>
            </nav>

            {/* BODY */}
            <div style={styles.mainContainer}>
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    activeService={activeService}
                    setActiveService={setActiveService}
                    user={user}
                    darkMode={darkMode}
                    onToggleDarkMode={onToggleDarkMode}
                />

                <main style={styles.content}>
                    {broadcast && (
                        <div style={s.broadcastBanner}>
                            <div style={s.scrollingContent}>
                                ⚠️ ATTENTION: {broadcast.message} — (System Broadcast)
                            </div>
                        </div>
                    )}
                    {renderContent()}
                </main>
            </div>

            <div style={styles.copyright_container}>
                <p style={styles.copyright_text}>©2026 Developed & Maintained by <strong>IT-QA CoE, GITC, SBI v1.0</strong></p>
            </div>
        </div>
    );
}


const s = {
    logo: {
        height: "46px",
        objectFit: "contain",
    },

    navcenter: {
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: "18px",
        fontWeight: "600"
    },

    brandTextSmall: {
        fontSize: "3rem",
        fontWeight: "600",
        color: "#1e293b",
    },

    dashboardNav: {
        backgroundColor: "var(--sidebar-bg)",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid var(--border-color)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
    },

    //   signoutBtn: {
    //     padding: "8px 26px",
    //     borderRadius: "30px",
    //     border: "none",
    //     background: "#ffd60a",
    //     color: "#0a1e3a",
    //     fontSize: "13.5px",
    //     fontWeight: "700",
    //     cursor: "pointer",
    //     fontFamily: "inherit",
    //   },

    logoutWrapper: {
        position: "relative",
        cursor: "pointer"
    },

    yellowBtn: {
        height: "34px"
    },

    logoutIcon: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        height: "18px"
    },

    bottomImageWrapper: {
        position: "absolute",
        bottom: "0",
        left: "0",
        zIndex: 4,
        width: "100%",
    },

    bottomImage: {
        width: "100vw",
        height: "auto",
        display: "block",
    },

    //     developerStrip: {
    //     float: "right",
    //     marginTop: "15px",
    //     padding: "8px",
    //     width: "70vW",
    //     backgroundColor: "#f9f9f9",
    //     // borderTop: "1px solid #ddd",
    //     textAlign: "center",
    //     fontSize: "12px",
    //     color: "#555",
    //     borderRadius: "10px 10px 10px 10px",
    //     position: "fixed",
    //     bottom: "0",
    //     left: "0",
    //     zIndex: 1000
    //   },

    broadcastBanner: {
        width: '100%',
        height: '34px',
        backgroundColor: '#ef4444',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },

    scrollingContent: {
        whiteSpace: 'nowrap',
        paddingLeft: '100%',
        display: 'inline-block',
        animation: 'scroll-banner 20s linear infinite',
        fontSize: '13px',
        fontWeight: '700'
    },
}


