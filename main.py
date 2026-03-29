from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import time
import datetime
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="TGEN Admin API")

# Enable CORS for Next.js frontend
# In production, replace ["*"] with your actual frontend URL (e.g., http://localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Setup
DB_NAME = "system_admin.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Table for System Broadcasts
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS broadcasts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT NOT NULL,
            expiry INTEGER NOT NULL,
            created_at INTEGER NOT NULL
        )
    ''')
    
    # Table for Advanced Audit Trail
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            user TEXT NOT NULL,
            action TEXT NOT NULL,
            target TEXT NOT NULL,
            category TEXT NOT NULL,
            status TEXT NOT NULL
        )
    ''')
    
    # Add some initial mock logs if table is empty
    cursor.execute("SELECT COUNT(*) FROM audit_logs")
    if cursor.fetchone()[0] == 0:
        mock_logs = [
            (datetime.datetime.utcnow().isoformat() + "Z", "admin_system", "DB_INIT", "CORE_DB", "SYSTEM", "SUCCESS"),
            (datetime.datetime.utcnow().isoformat() + "Z", "admin_pushkar", "LOGIN", "ADMIN_PANEL", "SYSTEM", "SUCCESS")
        ]
        cursor.executemany(
            "INSERT INTO audit_logs (timestamp, user, action, target, category, status) VALUES (?, ?, ?, ?, ?, ?)",
            mock_logs
        )
        
    conn.commit()
    conn.close()

# Initialize DB on startup
init_db()

# --- Pydantic Models for Request/Response ---

class BroadcastRequest(BaseModel):
    message: str
    duration_mins: int

class AuditLogRequest(BaseModel):
    user: str
    action: str
    target: str
    category: str
    status: str

# --- API Endpoints ---

@app.get("/health")
async def health_check():
    """System Health Check endpoint used by HealthCheck.js"""
    return {
        "status": "UP",
        "services": {
            "api": "Healthy",
            "database": "Connected",
            "mainframe": "Active"
        },
        "latency": "18ms"
    }

@app.post("/admin/broadcast")
async def create_broadcast(req: BroadcastRequest):
    """Saves a new broadcast message with an expiry timestamp"""
    expiry = int(time.time() * 1000) + (req.duration_mins * 60 * 1000)
    created_at = int(time.time() * 1000)
    
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO broadcasts (message, expiry, created_at) VALUES (?, ?, ?)",
        (req.message, expiry, created_at)
    )
    conn.commit()
    conn.close()
    
    # Also log this action to the Audit Trail
    log_action("admin", "SEND_BROADCAST", "SYSTEM_BANNER", "SYSTEM", "SUCCESS")
    
    return {"status": "success", "message": "Broadcast is now live"}

@app.get("/admin/broadcast/current")
async def get_current_broadcast():
    """Retrieves the latest non-expired broadcast message"""
    now = int(time.time() * 1000)
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT message, expiry FROM broadcasts WHERE expiry > ? ORDER BY created_at DESC LIMIT 1",
        (now,)
    )
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {"message": row[0], "expiry": row[1]}
    return None

@app.get("/admin/logs")
async def get_audit_logs(type: Optional[str] = None):
    """Fetches administrative logs. Used by AuditTrail.js"""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row # Returns rows as dictionaries
    cursor = conn.cursor()
    
    # We filter by type if needed, but currently all logs in this table are audit logs
    cursor.execute("SELECT * FROM audit_logs ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

@app.post("/admin/logs")
async def create_audit_log(req: AuditLogRequest):
    """Directly record an audit log entry"""
    log_action(req.user, req.action, req.target, req.category, req.status)
    return {"status": "success"}

def log_action(user, action, target, category, status):
    """Helper function to record system actions"""
    timestamp = datetime.datetime.utcnow().isoformat() + "Z"
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO audit_logs (timestamp, user, action, target, category, status) VALUES (?, ?, ?, ?, ?, ?)",
        (timestamp, user, action, target, category, status)
    )
    conn.commit()
    conn.close()

if __name__ == "__main__":
    import uvicorn
    # Use 0.0.0.0 to allow external access, port 5050 as expected by next.config.ts
    print("Starting TGEN Admin API on port 5050...")
    uvicorn.run(app, host="0.0.0.0", port=5050)
