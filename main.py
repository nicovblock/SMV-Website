import os
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler


class NoCacheStaticHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'public, max-age=300')
        super().end_headers()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '8080'))
    server = ThreadingHTTPServer(('0.0.0.0', port), NoCacheStaticHandler)
    print(f'Serving static site on 0.0.0.0:{port}')
    server.serve_forever()
