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

def get_email_by_token(token):
    try:
        cursor = get_db().execute('SELECT email FROM signed_in WHERE token = ?;', [token])
        user = cursor.fetchone()

        return user      
    except:
        return None

def get_user_by_token(token):
    try:
        email = get_email_by_token(token)
        cursor = get_db().execute('SELECT * FROM signed_in WHERE email = ?;', [email])
        user = cursor.fetchone()

        return user      
    except:
        return None

def get_token_by_email(email):
    try:
        cursor = get_db().execute('SELECT token FROM signed_in WHERE email = ?;', [email])
        user = cursor.fetchone()

        return user[0]      
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
        check_signedin(token)

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
        return False

def change_password(email, password):
    try:
        cursor = get_db().execute("UPDATE users SET password = ? WHERE email = ?", [password, email])
        get_db().commit()
        cursor.close()  
        return check_password(email, password)
    except:
        return False
    
def check_signedin(token):
    cursor = get_db().execute("SELECT email FROM signed_in WHERE token = ?", [token])
    email = cursor.fetchone()
    if email is None:
        return None
    return email[0]

def post_message(sender_email, reciever_email, message):
    try:
        get_db().execute("INSERT INTO messages (message, user_email, author_email) VALUES (?, ?, ?);", [message, reciever_email, sender_email])
        get_db().commit()
        return True
    except:
        return False
    
def get_messages(email):
    cursor = get_db().execute("SELECT message, author_email FROM messages WHERE user_email = ?", [email])
    messages = cursor.fetchall()
    if messages is None:
        return None
    return messages