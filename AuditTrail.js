'use client';
import React, { useState, useEffect } from 'react';
import { Search, History, Filter, Download } from 'lucide-react';

const AuditTrail = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/admin/logs?type=audit`, { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch audit records");
            const data = await res.json();
            setLogs(data);
        } catch (err) {
            console.error(err);
            // Mock data for display if API fails
            setLogs([
                { id: 1, timestamp: new Date().toISOString(), user: 'admin_pushkar', action: 'CREATE_USER', target: 'user_qa_01', category: 'USER_MGMT', status: 'SUCCESS' },
                { id: 2, timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'admin_pushkar', action: 'EDIT_ERROR_CODE', target: 'ERR_126', category: 'ERROR_RESOLVER', status: 'SUCCESS' },
                { id: 3, timestamp: new Date(Date.now() - 86400000).toISOString(), user: 'admin_pushkar', action: 'EXPORT_BATCH', target: 'BATCH_992', category: 'REPORTING', status: 'SUCCESS' },
                { id: 4, timestamp: new Date(Date.now() - 172800000).toISOString(), user: 'system_job', action: 'DB_BACKUP', target: 'CORE_DB', category: 'SYSTEM', status: 'SUCCESS' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        (log.user.toLowerCase().includes(search.toLowerCase()) || log.target.toLowerCase().includes(search.toLowerCase())) &&
        (filterCategory === 'ALL' || log.category === filterCategory)
    );

    return (
        <div style={container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={heading}>Advanced Audit Trail</h1>
                    <p style={subheading}>Detailed record-level logs of all administrative actions and system modifications.</p>
                </div>
                <button style={exportBtn}>
                    <Download size={18} />
                    Export Full Audit
                </button>
            </div>

            <div style={card}>
                <div style={toolbar}>
                    <div style={searchWrapper}>
                        <Search size={18} style={searchIcon} />
                        <input
                            style={searchInput}
                            placeholder="Search by User or Target Record..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={filterWrapper}>
                        <Filter size={18} style={{ color: 'var(--text-muted)' }} />
                        <select
                            style={select}
                            value={filterCategory}
                            onChange={e => setFilterCategory(e.target.value)}
                        >
                            <option value="ALL">All Categories</option>
                            <option value="USER_MGMT">User Management</option>
                            <option value="ERROR_RESOLVER">Error Resolver</option>
                            <option value="REPORTING">Reporting</option>
                            <option value="SYSTEM">System</option>
                        </select>
                    </div>
                </div>

                <table style={table}>
                    <thead>
                        <tr>
                            <th style={th}>TIMESTAMP</th>
                            <th style={th}>INITIATOR</th>
                            <th style={th}>ACTION</th>
                            <th style={th}>TARGET RECORD</th>
                            <th style={th}>CATEGORY</th>
                            <th style={th}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.id} style={tr}>
                                <td style={td}>{new Date(log.timestamp).toLocaleString()}</td>
                                <td style={{ ...td, fontWeight: '700', color: 'var(--accent-blue)' }}>{log.user}</td>
                                <td style={td}>
                                    <span style={actionBadge}>{log.action}</span>
                                </td>
                                <td style={td}>{log.target}</td>
                                <td style={td}>{log.category}</td>
                                <td style={td}>
                                    <span style={{ color: log.status === 'SUCCESS' ? '#22c55e' : '#ef4444', fontWeight: '700', fontSize: '12px' }}>
                                        ● {log.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const container = { padding: '32px' };
const heading = { fontSize: '28px', fontWeight: '700', color: 'var(--foreground)', marginBottom: '8px' };
const subheading = { fontSize: '15px', color: 'var(--text-muted)' };
const exportBtn = { backgroundColor: 'var(--accent-blue)', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' };
const card = { backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' };
const toolbar = { padding: '20px', display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' };
const searchWrapper = { flex: 1, position: 'relative' };
const searchIcon = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' };
const searchInput = { width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background)', color: 'var(--foreground)', fontSize: '14px', outline: 'none' };
const filterWrapper = { display: 'flex', alignItems: 'center', gap: '8px' };
const select = { padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background)', color: 'var(--foreground)', outline: 'none', fontSize: '14px' };
const table = { width: '100%', borderCollapse: 'collapse' };
const th = { padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' };
const tr = { borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s ease' };
const td = { padding: '16px 20px', fontSize: '14px', color: 'var(--foreground)' };
const actionBadge = { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' };

export default AuditTrail;
