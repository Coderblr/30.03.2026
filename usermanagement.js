
"use client";

import { useEffect, useState } from "react";

export default function UserManagement({ onViewUser, onViewLogs }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showImportModal, setShowAddModal] = useState(false);
    const [bulkData, setBulkData] = useState("");
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    const usersPerPage = 10;

    useEffect(() => {
        fetchUsers();
    }, []);

    /* ===================== */
    /* FETCH USERS (REAL API) */
    /* ===================== */
    async function fetchUsers() {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${BASE_URL}/admin/users`, {
                credentials: "include", // Add this
                headers: {
                },
            });

            if (!res.ok) throw new Error("Failed to load users");

            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch {
            setError("Failed to load users");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }

    /* ===================== */
    /* ENABLE / DISABLE USER */
    /* ===================== */
    async function toggleUserStatus(username, currentDisabled) {
        // Optimistic UI update
        setUsers(prev =>
            prev.map(u =>
                u.username === username
                    ? { ...u, disabled: !currentDisabled }
                    : u
            )
        );

        try {
            const res = await fetch(
                `${BASE_URL}/admin/users/status?username=${username}&disabled=${!currentDisabled}`,
                {
                    credentials: "include", method: "POST", headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!res.ok) throw new Error("Update failed");
        } catch {
            setError("Failed to update user status");
            fetchUsers(); // rollback
        }
    }

    async function promoteUser(username) {
        if (!window.confirm(`Are you sure you want to promote ${username} to Administrator?`)) return;

        try {
            const res = await fetch(`${BASE_URL}/admin/users/promote?username=${username}`, {
                credentials: "include",
                method: "POST"
            });
            if (!res.ok) throw new Error("Promotion failed");
            setSuccess(`User ${username} is now an Admin!`);
            fetchUsers();
            setTimeout(() => setSuccess(""), 3000);
        } catch {
            setError("Failed to promote user");
        }
    }

    const exportToCSV = () => {
        const headers = ["Username", "First Name", "Last Name", "Department", "Role", "Status"];
        const rows = users.map(u => [
            u.username,
            u.firstName,
            u.lastName,
            u.departmentCode,
            u.userType === 1 ? "Admin" : "User",
            u.disabled ? "Disabled" : "Enabled"
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'user_list.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleBulkImport = async () => {
        setLoading(true);
        try {
            const lines = bulkData.split('\n').filter(l => l.trim());
            // Expected format: username,firstname,lastname,dept
            const payload = lines.map(line => {
                const [username, firstName, lastName, departmentCode] = line.split(',');
                return { username, firstName, lastName, departmentCode, password: 'Password@123' };
            });

            const res = await fetch(`${BASE_URL}/admin/users/bulk`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Bulk import failed");

            setSuccess("Bulk users imported successfully!");
            setShowAddModal(false);
            setBulkData("");
            fetchUsers();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Pagination logic
    const totalPages = Math.ceil(users.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

    return (
        <div style={page}>
            <h1 style={heading}>User Management</h1>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <p style={subHeading}>Manage user access, roles, and bulk operations</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setShowAddModal(true)} style={secondaryBtn}>Bulk Import</button>
                    <button onClick={exportToCSV} style={secondaryBtn}>Export CSV</button>
                </div>
            </div>

            {loading && <div style={{ color: 'var(--foreground)' }}>Processing...</div>}
            {error && <div style={errorAlert}>{error}</div>}
            {success && <div style={successAlert}>{success}</div>}

            <div style={card}>
                <table style={table}>
                    <thead>
                        <tr>
                            <th style={tableHeaderCell}>#</th>
                            <th style={tableHeaderCell}>Username</th>
                            <th style={tableHeaderCell}>Full Name</th>
                            <th style={tableHeaderCell}>Department</th>
                            <th style={tableHeaderCell}>Role</th>
                            <th style={tableHeaderCell}>Status</th>
                            <th style={tableHeaderCell}>Admin Action</th>
                            <th style={tableHeaderCell}>State</th>
                            <th style={tableHeaderCell}>Logs</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentUsers.map((u, i) => (
                            <tr key={u.username} style={tableRow}>
                                <td style={tableCell}>{indexOfFirstUser + i + 1}</td>

                                <td style={tableCell}>
                                    <button
                                        onClick={() => onViewUser && onViewUser(u)}
                                        style={usernameBtn}
                                    >
                                        {u.username}
                                    </button>
                                </td>

                                <td style={tableCell}>{u.firstName} {u.lastName}</td>
                                <td style={tableCell}>{u.departmentCode}</td>

                                <td style={tableCell}>
                                    <span style={{ fontWeight: '700', color: u.userType === 1 ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                                        {u.userType === 1 ? "ADMIN" : "USER"}
                                    </span>
                                </td>

                                <td style={tableCell}>
                                    <span style={statusBadge(!u.disabled)}>
                                        {u.disabled ? "Disabled" : "Enabled"}
                                    </span>
                                </td>

                                <td style={tableCell}>
                                    {u.userType !== 1 ? (
                                        <button
                                            style={{ ...actionButton, backgroundColor: "#7c3aed" }}
                                            onClick={() => promoteUser(u.username)}
                                        >
                                            Promote to Admin
                                        </button>
                                    ) : (
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>System Admin</span>
                                    )}
                                </td>

                                <td style={tableCell}>
                                    <button
                                        style={{
                                            ...actionButton,
                                            backgroundColor: u.disabled ? "#10b981" : "#ef4444",
                                        }}
                                        onClick={() =>
                                            toggleUserStatus(u.username, u.disabled)
                                        }
                                    >
                                        {u.disabled ? "Enable" : "Disable"}
                                    </button>
                                </td>

                                <td style={tableCell}>
                                    <button
                                        onClick={() => onViewLogs && onViewLogs(u)}
                                        style={{ ...actionButton, backgroundColor: "var(--accent-blue)" }}
                                    >
                                        View Logs
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && !loading && (
                    <div>No users found</div>
                )}

                {users.length > 0 && (
                    <div style={paginationContainer}>
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={paginationButton}
                        >
                            Previous
                        </button>
                        <span style={paginationInfo}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={paginationButton}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* BULK IMPORT MODAL */}
            {showImportModal && (
                <div style={modalOverlay}>
                    <div style={modalCard}>
                        <h2 style={{ marginBottom: '12px', color: 'var(--foreground)' }}>Bulk User Import</h2>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                            Paste user details in CSV format: <b>username,firstname,lastname,dept</b> (one per line).
                        </p>
                        <textarea
                            style={bulkInput}
                            placeholder="jdoe,John,Doe,QA&#10;asmith,Alice,Smith,DEV"
                            value={bulkData}
                            onChange={e => setBulkData(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                            <button onClick={() => setShowAddModal(false)} style={paginationButton}>Cancel</button>
                            <button
                                onClick={handleBulkImport}
                                disabled={!bulkData.trim()}
                                style={{ ...paginationButton, backgroundColor: 'var(--accent-blue)', color: 'white', border: 'none' }}
                            >
                                Import Users
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalCard = { backgroundColor: 'var(--card-bg)', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '500px', border: '1px solid var(--border-color)' };
const bulkInput = { width: '100%', height: '200px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background)', color: 'var(--foreground)', fontFamily: 'monospace', fontSize: '13px', resize: 'none' };
const secondaryBtn = { padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' };
const successAlert = { backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px', fontWeight: '600' };

/* ===================== */
/* STYLES */
/* ===================== */

const page = {
    padding: "32px",
    backgroundColor: "var(--background)",
    minHeight: "100vh",
    color: "var(--foreground)",
};

const heading = {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "4px",
    color: "var(--foreground)",
};

const subHeading = {
    fontSize: "14px",
    color: "var(--text-muted)",
};

const card = {
    background: "var(--card-bg)",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    border: "1px solid var(--border-color)",
};

const table = {
    width: "100%",
    borderCollapse: "collapse",
};

const tableHeaderCell = {
    padding: "16px 12px",
    textAlign: "left",
    borderBottom: "2px solid var(--border-color)",
    fontWeight: "600",
    color: "var(--foreground)",
    fontSize: "13px",
    textTransform: "uppercase",
};

const tableRow = {
    borderBottom: "1px solid var(--border-color)",
};

const tableCell = {
    padding: "16px 12px",
    fontSize: "14px",
    color: "var(--foreground)",
};

const usernameBtn = {
    background: "transparent",
    border: "none",
    color: "var(--accent-blue)",
    cursor: "pointer",
    fontWeight: "700",
};

const statusBadge = enabled => ({
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    backgroundColor: enabled ? "#ecfdf5" : "#fef2f2",
    color: enabled ? "#065f46" : "#991b1b",
    border: `1px solid ${enabled ? "#6ee7b7" : "#fecaca"}`,
});

const actionButton = {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
};

const errorAlert = {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    color: "#dc2626",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "16px",
    fontSize: "14px",
};

const paginationContainer = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    marginTop: "20px",
};

const paginationButton = {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--card-bg)",
    color: "var(--foreground)",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "600",
};

const paginationInfo = {
    fontSize: "14px",
    fontWeight: "500",
};

