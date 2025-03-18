from flask import Flask, request, jsonify, app 
from flask_sock import Sock
import json
import random
import string
import database_helper as dh
import re


app = Flask(__name__)
sock = Sock(app)

active_sockets = dict()

@sock.route("/connect")
def connect(ws):
    token = request.args.get('token')
    email = dh.get_email_by_token(token)
    if email == None:
        ws.close()
        return
    active_sockets[email] = {
        'ws': ws,
        'token': token
    }

    try:
        while True:
            message = ws.receive()
            if message is None:
                break
            try:
                data = json.loads(message)
            except json.JSONDecodeError:
                print("Received invalid JSON")
                continue
    except Exception as e:
        print("Exception error (connect):", e)
    finally:
        conn = active_sockets.get(email)
        if conn is not None and conn.get('token') == token:
            conn['ws'].close()
            active_sockets.pop(email, None)

def emailValid(email):
    if email is None:
        return False
    else:
        return re.match(r'^[\w]+@[\w]+\.[\w]+$', email)

def make_token():
    return ''.join(random.choice(string.ascii_letters + string.digits) for i in range(36))

@app.teardown_appcontext
def close_connection(exception):
    """closes the database connection after each request"""
    dh.disconnect_db(exception)

@app.route("/", methods=['GET'])
def index():
    return app.send_static_file('client.html')

@app.route('/sign_up', methods=['POST'])
def sign_up():
    data = request.get_json()
    if data is None:
        return jsonify({'message': 'No inputs'}), 400

    if not('email' in data or 'password' in data or 
          'firstname' in data or 'familyname' in data or 
          'gender' in data or 'city' in data or 
          'country' in data or len(data['password'])>=6):
        return jsonify({'message': 'Missing input'}), 400
    if (exists(data['email'])):
        return jsonify({'message': 'User already exists'}), 409

    elif not emailValid(data['email']):
        return jsonify({'message': 'Email is not valid'}), 400
    
    try:
        dh.create_user(data['email'], data['password'], 
                       data['firstname'], data['familyname'], 
                       data['gender'], data['city'], data['country'])
        
        return jsonify({'message': 'new user added successfully'}), 201
    except:
        return jsonify({'message': 'Something went wrong?'}), 500

@app.route('/sign_in', methods=['POST'])
def sign_in():
    data = request.get_json()
    if data is None:
        return jsonify({'message': 'No inputs'}), 400
    elif not ('email' in data or 'password' in data):
        return jsonify({'message': 'Missing inputs'}), 400
    elif not (exists(data['email'])):
        return jsonify({'message': 'User does not exist'}), 404
    elif not emailValid(data['email']):
        return jsonify({'message': 'Email is not valid'}), 400
    elif not dh.check_password(data['email'], data['password']):
        return jsonify({'message': 'Wrong email or password'}), 401 
    
    token = make_token()
    dh.sign_out_email(data['email'])

    connection = active_sockets.get(data['email'])
    if connection is not None:
        try:
            message = {}
            message['action'] = "sign_out"
            connection['ws'].send(json.dumps(message))
            connection['ws'].close()
        except:
            pass
        active_sockets.pop(data['email'], None)

    if dh.sign_in(token, data['email']):
        return jsonify({'message': 'Successfully signed in', 'data': token}), 200
    else:
        return jsonify({'message': 'Something went wrong? UWU'}), 500

@app.route('/sign_out', methods=['DELETE'])
def sign_out():
    token = request.headers.get('Authorization')
    if token is None:
        return jsonify({'message': 'No Token in request'}), 400
    if not dh.check_signedin(token):
        return jsonify({'message': 'User not logged in'}), 401
    

    if not dh.sign_off(token):
        return jsonify({'message': 'Failed to log out, try again'}), 500
    
    connection = active_sockets.get(dh.get_email_by_token(token))
    if connection is not None:
        try:
            message = {}
            message['action'] = "sign_out"
            connection['ws'].send(json.dumps(message))
            connection['ws'].close()
        except:
            pass
        active_sockets.pop(dh.get_email_by_token(token), None)
    return jsonify({'message': 'Successfully signed out'}), 200

@app.route('/get_user_data_by_token', methods=['GET'])
def get_user_data_by_token():
    token = request.headers.get('Authorization')
    if token is None:
        return jsonify({'message': 'Missing token'}), 400
    
    email = dh.get_email_by_token(token)
    if email == None:
        return jsonify({'message': 'Missing email for token'}), 400
    
    user = dh.get_user_by_email(email)
    if (user != None):
        return jsonify({'message': 'User data has been found', 'data': user}), 200
    else:
        return jsonify({'message': 'User data has not been found'}), 500

@app.route('/get_user_data_by_email/<email>', methods=['GET'])
def get_user_data_by_email(email):
    token = request.headers.get('Authorization')
    if token is None or email is None:
        return jsonify({'message': 'Missing inputs'}), 400
    elif not(emailValid(email)):
        return jsonify({'message': 'Incorrect email'}), 400
    
    signed_in = dh.check_signedin(token)
    if signed_in == False:
        return jsonify({'message': 'Not logged in'}), 401
    try:
        user = dh.get_user_by_email(email)
        if (user != None):
            return jsonify({'message': 'User data has been found', 'data': user}), 200
        else:
            return jsonify({'message': 'User not found!'}), 404
    except:
        return jsonify({'message': 'Something went wrong!'}), 500


@app.route('/post_message', methods=['POST'])
def post_mesage():
    data = request.get_json()
    token = request.headers.get('Authorization')
    if data is None:
        return jsonify({'message': 'No inputs'}), 401
    elif token is None:
        return jsonify({'message': 'Missing token'}), 401
    elif not dh.get_email_by_token(token):
        return jsonify({'message': 'no matching email to token'}), 400
    elif not (isinstance(data['email'], str) and isinstance(data['message'], str)):
        return jsonify({'message': 'Missing inputs'}), 401
    elif dh.get_user_by_email(data['email']) == None:
        return jsonify({'message': 'User does not exist'}), 404

    sender = dh.get_email_by_token(token)
    try:
        dh.post_message(sender, data['email'], data['message'])
        return jsonify({'message': 'Message has been posted'}), 201
    except:
        return jsonify({'message': 'Message has not been posted'}), 500
    
@app.route('/get_user_messages_by_token', methods=['GET'])
def get_user_messages_by_token():
    token = request.headers.get('Authorization')
    if token is None:
        return jsonify({'message': 'Missing token'}), 401
    
    email = dh.get_email_by_token(token)
    if (email is None or not emailValid(email)):
        return jsonify({'message': 'Incorrect email'}), 401
    
    try:
        messages = dh.get_messages(email)
        return jsonify({'message': 'Messages has been collected', 'data': messages}), 200
    except:
        return jsonify({'message': 'Something went wrong'}), 500

@app.route('/get_user_messages_by_email/<email>', methods=['GET'])
def get_user_messages_by_email(email):
    token = request.headers.get('Authorization')
    if token is None:
        return jsonify({'message': 'Missing token'}), 401
    
    signed_in = dh.check_signedin(token)
    if signed_in == False:
        return jsonify({'message': 'Not logged in'}), 401
    
    if dh.get_user_by_email(email) is None:
        return jsonify({'message': 'User not found'}), 404

    if (email is None or not emailValid(email)):
        return jsonify({'message': 'Incorrect email'}), 401

    try:
        messages = dh.get_messages(email)
        return jsonify({'message': 'Messages has been collected', 'data': messages}), 200
    except:
        return jsonify({'message': 'There is no messages'}), 500

def exists(email):
    user = dh.get_user_by_email(email)
    if user is None:
        result = False
    else:
        result = True
    return result

@app.route('/change_password', methods=['PUT'])
def change_password():
    data = request.get_json()
    auth = request.headers.get('Authorization')
    if data is None:
        return jsonify({'message': 'No inputs'}), 400
    elif auth is None:
        return jsonify({'message': 'Not logged in'}), 401
    
    email = dh.get_email_by_token(auth)

    if email is None:
        return jsonify({'message': 'Not logged in'}), 401
    elif not ('oldpassword' in data and 'newpassword' in data):
        return jsonify({'message': 'Missing inputs'}), 400
    elif not isinstance(data['newpassword'], str) or len(data['newpassword']) < 6:
        return jsonify({'message': 'Password too short'}), 400
    elif not dh.check_password(email, data['oldpassword']):
        return jsonify({'message': 'Wrong password'}), 401
    
    try:
        dh.change_password(email, data['newpassword'])
        return jsonify({'message': 'Password changed'}), 200
    except:
        return jsonify({'message': 'Something went wrong'}), 500
    
if __name__ == '__main__':
    dh.init_db()
    app.debug = True
    app.run()