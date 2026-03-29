'use client';

import React, { useState } from 'react';
import styles from './ErrorREsolverView.module.css';

const ErrorResolverView = () => {
    const [searchCode, setSearchCode] = useState('');
    const [result, setResult] = useState(null);
    const [isSearched, setIsSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        error_code: '',
        error_description: '',
        cause1: '',
        cause2: '',
        action1: '',
        action2: ''
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ text: '', type: '' });

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    // ✅ Utility to format numbered text (no JSX/CSS change)
    const formatNumberedText = (items) =>
        items
            .filter(Boolean)
            .map((item, index) => `${index + 1}. ${item}`)
            .join('\n');

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!searchCode.trim()) return;

        setIsSearched(true);
        setLoading(true);
        setResult(null);
        try {
            const response = await fetch(
                `${BASE_URL}/error?error_code=${searchCode.trim()}`,
                {
                    credentials: "include", // Add this
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    setResult(null);
                    return;
                }
                throw new Error('Server error');
            }

            const data = await response.json();

            // 🔥 Map backend response → existing UI structure
            const mappedResult = {
                code: data.error_code,
                description: data.error_description,
                causes: formatNumberedText([data.cause1, data.cause2]),
                solution: formatNumberedText([data.action1, data.action2])
            };

            setResult(mappedResult);
        } catch (error) {
            console.error('Error fetching error details:', error);
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAddError = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setSubmitMessage({ text: '', type: '' });

        try {
            const response = await fetch(`${BASE_URL}/error`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error("Failed to add error record");

            setSubmitMessage({ text: "Error record added successfully!", type: "success" });

            // Clear form and close modal after delay
            setTimeout(() => {
                setShowAddModal(false);
                setFormData({ error_code: '', error_description: '', cause1: '', cause2: '', action1: '', action2: '' });
                setSubmitMessage({ text: '', type: '' });
                // If the user just added the code they were searching for, trigger search
                if (formData.error_code === searchCode) handleSearch(new Event('submit'));
            }, 2000);

        } catch (err) {
            setSubmitMessage({ text: err.message, type: "error" });
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className={styles.viewContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    Error <span style={{ color: '#3b82f6' }}>Resolver</span>
                </h1>
                <p className={styles.subtitle}>
                    Locate solutions and causes for system errors instantly.
                </p>
                <button
                    onClick={() => setShowAddModal(true)}
                    className={styles.searchButton}
                    style={{ marginTop: '16px', background: 'var(--accent-blue)', width: 'auto', padding: '10px 24px' }}
                >
                    + Add New Error
                </button>
            </div>

            <form onSubmit={handleSearch} className={styles.searchBox}>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Type error code (e.g. 126)..."
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                />
                <button
                    type="submit"
                    className={styles.searchButton}
                    disabled={loading}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {isSearched && (
                <div className={styles.resultArea}>
                    {result ? (
                        <div className={styles.resultCard}>
                            <h2 className={styles.errorCode}>{result.code}</h2>

                            <div className={styles.section}>
                                <span className={styles.label}>Description</span>
                                <p className={styles.value}>{result.description}</p>
                            </div>

                            <div className={styles.section}>
                                <span className={styles.label}>What causes this?</span>
                                <p
                                    className={styles.value}
                                    style={{ whiteSpace: 'pre-line' }}
                                >
                                    {result.causes}
                                </p>
                            </div>

                            <div className={styles.section}>
                                <span className={styles.label}>How to resolve?</span>
                                <div className={styles.solutionBox}>
                                    <p
                                        className={styles.value}
                                        style={{ whiteSpace: 'pre-line' }}
                                    >
                                        {result.solution}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.notFound}>
                            <h3>Record Not Found</h3>
                            <p>
                                The error code "{searchCode}" was not found in our database.
                            </p>
                            <button
                                onClick={() => {
                                    setFormData({ ...formData, error_code: searchCode });
                                    setShowAddModal(true);
                                }}
                                style={{
                                    marginTop: '20px',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--accent-blue)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Add "{searchCode}" to Database
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ADD ERROR MODAL */}
            {showAddModal && (
                <div style={modalOverlay}>
                    <div style={modalCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--foreground)' }}>Add New Error Record</h2>
                            <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
                        </div>

                        <form onSubmit={handleAddError}>
                            <div style={formGroup}>
                                <label style={label}>Error Code <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    required
                                    style={input}
                                    placeholder="e.g. 126"
                                    value={formData.error_code}
                                    onChange={e => setFormData({ ...formData, error_code: e.target.value })}
                                />
                            </div>

                            <div style={formGroup}>
                                <label style={label}>Error Description <span style={{ color: '#ef4444' }}>*</span></label>
                                <textarea
                                    required
                                    style={{ ...input, height: '80px', resize: 'none' }}
                                    placeholder="Briefly describe the error..."
                                    value={formData.error_description}
                                    onChange={e => setFormData({ ...formData, error_description: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={formGroup}>
                                    <label style={label}>Primary Cause</label>
                                    <input
                                        style={input}
                                        placeholder="Reason 1"
                                        value={formData.cause1}
                                        onChange={e => setFormData({ ...formData, cause1: e.target.value })}
                                    />
                                </div>
                                <div style={formGroup}>
                                    <label style={label}>Secondary Cause</label>
                                    <input
                                        style={input}
                                        placeholder="Reason 2"
                                        value={formData.cause2}
                                        onChange={e => setFormData({ ...formData, cause2: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={formGroup}>
                                    <label style={label}>Primary Solution</label>
                                    <input
                                        style={input}
                                        placeholder="Step 1"
                                        value={formData.action1}
                                        onChange={e => setFormData({ ...formData, action1: e.target.value })}
                                    />
                                </div>
                                <div style={formGroup}>
                                    <label style={label}>Secondary Solution</label>
                                    <input
                                        style={input}
                                        placeholder="Step 2"
                                        value={formData.action2}
                                        onChange={e => setFormData({ ...formData, action2: e.target.value })}
                                    />
                                </div>
                            </div>

                            {submitMessage.text && (
                                <div style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '20px',
                                    backgroundColor: submitMessage.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: submitMessage.type === 'success' ? '#16a34a' : '#dc2626',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    textAlign: 'center'
                                }}>
                                    {submitMessage.text}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    style={secondaryBtn}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitLoading}
                                    style={primaryBtn}
                                >
                                    {submitLoading ? 'Saving...' : 'Save Error Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────
   MODAL STYLES
───────────────────────────────────────── */
const modalOverlay = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px'
};

const modalCard = {
    backgroundColor: 'var(--card-bg)',
    padding: '32px',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
    border: '1px solid var(--border-color)',
    maxHeight: '90vh',
    overflowY: 'auto'
};

const formGroup = {
    marginBottom: '20px'
};

const label = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--foreground)'
};

const input = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s ease'
};

const primaryBtn = {
    flex: 1,
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: 'var(--accent-blue)',
    color: 'white',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease'
};

const secondaryBtn = {
    padding: '14px 24px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
};

export default ErrorResolverView;
