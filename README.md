gevent-websocket
gevent

gunicorn -b 0.0.0.0:5000 --workers 1 --threads 100 server:app