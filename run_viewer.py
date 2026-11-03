#!/usr/bin/env python3
"""
Cozmo Animation Studio & Video Viewer Launcher
Khởi chạy máy chủ nội bộ (Local Server) và tự động mở giao diện Web trên trình duyệt.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

DEFAULT_PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Clean server output
        sys.stderr.write("%s - - [%s] %s\n" % (self.address_string(), self.log_date_time_string(), format % args))

def find_available_port(start_port=8000, max_tries=50):
    import socket
    for port in range(start_port, start_port + max_tries):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('127.0.0.1', port)) != 0:
                return port
    return start_port

def main():
    port = find_available_port(DEFAULT_PORT)
    url = f"http://localhost:{port}/index.html"
    
    print("=" * 60)
    print("  🚀 COZMO ANIMATION STUDIO & VIDEO VIEWER")
    print("=" * 60)
    print(f"  📂 Thư mục: {DIRECTORY}")
    print(f"  🌐 Đang chạy máy chủ tại: {url}")
    print("  ⭐ Nhấn Ctrl + C để dừng máy chủ")
    print("=" * 60)

    try:
        # Open browser automatically
        webbrowser.open(url)
        with socketserver.TCPServer(("", port), Handler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n  👋 Đã tắt máy chủ Cozmo Studio. Hẹn gặp lại!")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)

if __name__ == "__main__":
    main()
