import sqlite3
from flask import g
from flask import Flask
app = Flask(__name__)

DATABASE_URI = "database.db"
conn = None

def init_db():
    global conn
    conn = sqlite3.connect(DATABASE_URI)
    c = conn.cursor()
    with open("schema.sql", "r") as file:
        command = file.read()
    c.executescript(command)
    conn.commit()
    conn.close()

def disconnect_db():
    db = getattr(g, 'db', None)
    if db is not None:
        g.db.close()
        g.db = None

def get_db():
    db = getattr(g, 'db', None)
    if db is None:
        db = g.db = sqlite3.connect(DATABASE_URI)
    
    return db

def get_user_by_email(email):
    try:
        cursor = get_db().execute('SELECT * FROM users WHERE email = ?;', [email])
        user = cursor.fetchone()

        return user      
    except:
        return None
        
def create_user(email, password, firstname, familyname, 
                gender, city, country):
    try:
        get_db().execute("INSERT INTO users values(?, ?, ?, ?, ?, ?, ?);", 
                         [email, password, firstname, familyname, 
                          gender, city, country])
        get_db().commit()
        return True
    except:
        return False

def sign_in(token, email):
    try:
        get_db().execute("INSERT INTO signed_in VALUES (?, ?);", [token, email])
        get_db().commit()
        return True
    except:
        return False


def sign_off(token):
    try:
        get_db().execute("SELECT email FROM signed_in WHERE token = ?", [token])
        get_db().commit()

        get_db().execute("DELETE FROM signed_in WHERE token = ?", [token])
        get_db().commit()
        return True
    except:
        return False

def check_password(email, password):
    try:
        cursor = get_db().execute("SELECT password FROM users WHERE email = ?", [email])
        password_check = cursor.fetchone()
        return (password == password_check[0])
    except:
        print("HEJ")
        return False