from flask import Flask, request, jsonify
import sqlite3
import uuid
import hashlib

app = Flask(__name__)

def get_db_connection():
    """creates and runns a new db connection"""
    connection = sqlite3.connect("twidder.db")
    connection.row_factory = sqlite3.Row 
    return connection

def init_data_base():
    with get_db_connection() as connection:
        cursor = connection.cursor()
        cursor.executescript(''' 
        CREATE TABLE IF NOT EXISTS users(
        email TEXT NOT NULL PRIMARY KEY,
        password TEXT NOT NULL,
        firstname TEXT NOT NULL,
        familyname TEXT NOT NULL,
        gener TEXT NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL
        );
        
        
        ''')

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"