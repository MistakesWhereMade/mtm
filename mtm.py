# mtm.py

import http.server
import socketserver

HOST = "127.0.0.1"
PORT = 8088

Handler = http.server.SimpleHTTPRequestHandler

try:
    server = socketserver.TCPServer((HOST, PORT), Handler)
    print("Serving at http://" + str(HOST) + ":" + str(PORT) + "/")
    server.serve_forever()
except:
    pass
finally:
    server.close()

