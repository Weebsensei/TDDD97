import sqlite3
from flask import g
from flask import Flask
app = Flask(__name__)

DATABASE_URI = "database.db"
connection = None

def get_db():
    db = getattr(g, 'db', None)
    if db is None:
        db = g.db = sqlite3.connect(DATABASE_URI)
    
    return db

def connect_DB():
    global connection
    connection = sqlite3.connect(DATABASE_URI)

def create_user(email, password, firstname, familyname, 
                gender, city, country):
    try:
        get_db().execute("INSERT INTO users (?, ?, ?, ?, ?, ?, ?);", 
                         [email, password, firstname, familyname, 
                          gender, city, country])
        get_db().commit()
        return True
    except:
        return False

    