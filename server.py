import http.server
import socketserver
import json
import os
import sqlite3
import urllib.parse
from datetime import datetime

PORT = 3000
DB_FILE = 'payments.db'
UPLOAD_DIR = 'uploads'

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize Database
def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS payments (
            student_id TEXT PRIMARY KEY,
            paid INTEGER DEFAULT 1,
            slip_filename TEXT,
            timestamp TEXT,
            ref_code TEXT,
            amount INTEGER DEFAULT 190,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

class AppRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        # API: Get all payment records
        if parsed.path == '/api/payments':
            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute('SELECT * FROM payments')
            rows = c.fetchall()
            conn.close()
            
            data = {}
            for r in rows:
                data[r['student_id']] = {
                    'paid': bool(r['paid']),
                    'slipUrl': f"/uploads/{r['slip_filename']}" if r['slip_filename'] else None,
                    'timestamp': r['timestamp'],
                    'refCode': r['ref_code'],
                    'amount': r['amount']
                }
                
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(data).encode('utf-8'))
            return
            
        # Serve static files from root or uploads
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        
        # API: Submit payment with base64/data slip
        if parsed.path == '/api/pay':
            content_length = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_length)
            
            try:
                payload = json.loads(post_body.decode('utf-8'))
                student_id = payload.get('studentId')
                slip_base64 = payload.get('slipBase64')
                timestamp = payload.get('timestamp') or datetime.now().strftime('%d/%m/%Y %H:%M:%S')
                ref_code = payload.get('refCode') or f"TXN-COMED-{student_id.replace('-', '')}"
                
                if not student_id:
                    self.send_error_response(400, "Missing student ID")
                    return
                
                filename = None
                if slip_base64:
                    # Save base64 image to file
                    import base64
                    header, data = slip_base64.split(';base64,') if ';base64,' in slip_base64 else ('', slip_base64)
                    ext = 'png'
                    if 'image/jpeg' in header or 'image/jpg' in header:
                        ext = 'jpg'
                    elif 'image/webp' in header:
                        ext = 'webp'
                    
                    filename = f"slip_{student_id.replace('-', '_')}_{int(datetime.now().timestamp())}.{ext}"
                    filepath = os.path.join(UPLOAD_DIR, filename)
                    with open(filepath, 'wb') as f:
                        f.write(base64.b64decode(data))
                
                # Save to SQLite Database
                conn = sqlite3.connect(DB_FILE)
                c = conn.cursor()
                c.execute('''
                    INSERT INTO payments (student_id, paid, slip_filename, timestamp, ref_code, amount)
                    VALUES (?, 1, ?, ?, ?, 190)
                    ON CONFLICT(student_id) DO UPDATE SET
                        paid = 1,
                        slip_filename = excluded.slip_filename,
                        timestamp = excluded.timestamp,
                        ref_code = excluded.ref_code
                ''', (student_id, filename, timestamp, ref_code))
                conn.commit()
                conn.close()
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                res = {
                    'success': True,
                    'studentId': student_id,
                    'slipUrl': f"/uploads/{filename}" if filename else None,
                    'timestamp': timestamp,
                    'refCode': ref_code
                }
                self.wfile.write(json.dumps(res).encode('utf-8'))
                return
                
            except Exception as e:
                self.send_error_response(500, str(e))
                return

        # API: Reset payment (for admin/re-upload)
        if parsed.path == '/api/reset':
            content_length = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_length)
            try:
                payload = json.loads(post_body.decode('utf-8'))
                student_id = payload.get('studentId')
                if student_id:
                    conn = sqlite3.connect(DB_FILE)
                    c = conn.cursor()
                    c.execute('DELETE FROM payments WHERE student_id = ?', (student_id,))
                    conn.commit()
                    conn.close()
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True}).encode('utf-8'))
                return
            except Exception as e:
                self.send_error_response(500, str(e))
                return

        self.send_error_response(404, "Endpoint not found")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def send_error_response(self, code, msg):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'error': msg}).encode('utf-8'))

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), AppRequestHandler) as httpd:
        print(f"Backend Server running at http://localhost:{PORT}")
        httpd.serve_forever()
