from flask import Flask, request, jsonify, app 
import hashlib
import uuid
import json
import random
import string
import database_helper as dh
import re

app = Flask(__name__)

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
    dh.disconnect_db()

@app.route("/", methods=['GET'])
def index():
    return app.send_static_file('client.html')

@app.route('/sign_up', methods=['POST'])
def sign_up():
    data = request.get_json()
    if data is None:
        return json.dumps({'message': 'No inputs'}), 400

    if not('email' in data or 'password' in data or 
          'firstname' in data or 'familyname' in data or 
          'gender' in data or 'city' in data or 
          'country' in data or len(data['password'])>=6):
        return json.dumps({'message': 'Missing input'}), 400
    if (exists(data['email'])):
        return json.dumps({'message': 'User already exists'}), 409

    elif not emailValid(data['email']):
        return json.dumps({'message': 'Email is not valid'}), 400
    
    try:
        dh.create_user(data['email'], data['password'], 
                       data['firstname'], data['familyname'], 
                       data['gender'], data['city'], data['country'])
        
        return json.dumps({'message': 'new user added successfully'}), 201
    except:
        return json.dumps({'message': 'Something went wrong?'}), 500

@app.route('/sign_in', methods=['POST'])
def sign_in():
    data = request.get_json()
    if data is None:
        return jsonify({'message': 'No inputs'}), 400
    elif not ('email' in data or 'password' in data):
        return jsonify({'message': 'Missing inputs'}), 400
    elif not (exists(data['email'])):
        return jsonify({'message': 'Wrong email or password'}), 404
    elif not emailValid(data['email']):
        return jsonify({'message': 'Email is not valid'}), 401
    elif not dh.check_password(data['email'], data['password']):
        return jsonify({'message': 'Wrong email or password'}), 404 
    
    token = make_token()
    
    if dh.sign_in(token, data['email']):
        return json.dumps({'success': True, 'message': 'Successfully signed in', 'data': token}), 200
    else:
        return json.dumps({'success': False, 'message': 'Something went wrong? UWU'}), 500


@app.route('/sign_out', methods=['DELETE'])
def sign_out():
    token = request.headers.get('Authorization')
    if token is None:
        return jsonify({'message': 'No Token in request'}), 400
    if not dh.check_signedin(token):
        return jsonify({'message': 'User not loggedin'}), 401
    try:
        dh.sign_off(token)
        return jsonify({'message': 'Successfully signed out'}), 200
    except:
        return jsonify({'message': 'Failed to log out, try again'}), 500



@app.route('/get_user_data_by_token', methods=['GET'])
def get_user_data_by_token():
    token = request.headers.get('Authorization')
    if token is None:
        return json.dumps({'success': False, 'message': 'Missing token'})
    
    email = dh.get_email_by_token(token)
    if email == None:
        return json.dumps({'success': False, 'message': 'Missing email for token'})
    
    user = dh.get_user_by_email(email[0])
    if (user != None):
        return json.dumps({'success': True, 'message': 'User data has been found', 'data': user})
    else:
        return json.dumps({'success': False, 'message': 'User data has not been found'})

@app.route('/get_user_data_by_email/<email>', methods=['GET'])
def get_user_data_by_email(email):
    token = request.headers.get('Authorization')
    if token is None:
        return json.dumps({'success': False, 'message': 'Missing token'})
    elif (email == None or not emailValid(email)):
        return json.dumps({'success': False, 'message': 'Incorrect email'})
    
    signed_in = dh.check_signedin(token)
    if signed_in == False:
        return json.dumps({'success': False, 'message': 'Not logged in'})
    user = dh.get_user_by_email(email)
    print(user)
    if (user != None):
        return json.dumps({'success': True, 'message': 'User data has been found', 'data': user})
    else:
        return json.dumps({'success': False, 'message': 'User data has not been found'})


@app.route('/post_message', methods=['POST'])
def post_mesage():
    data = request.get_json()
    token = request.headers.get('Authorization')
    if data is None:
        return json.dumps({'success': False, 'message': 'No inputs'})
    elif token is None:
        return json.dumps({'success': False, 'message': 'Missing token'})
    elif not dh.get_email_by_token(token):
        return json.dumps({'success': False, 'message': 'no matching email to token'})
    elif not ('email' in data):
        return json.dumps({'success': False, 'message': 'Missing reciever'})
    elif data['message'] == None:
        return json.dumps({'success': False, 'message': 'Missing message'})
    elif dh.get_user_by_email(data['email']) == None:
        return json.dumps({'success': False, 'message': 'User does not exist'})
    
    sender = dh.get_email_by_token(token)
    try:
        dh.post_message(sender, data['email'], data['message'])
        return json.dumps({'success': True, 'message': 'Message has been posted'})
    except:
        return json.dumps({'success': False, 'message': 'Message has not been posted'})
    
@app.route('/get_user_messages_by_token', methods=['GET'])
def get_user_messages_by_token():
    token = request.headers.get('Authorization')
    if token is None:
        return json.dumps({'success': False, 'message': 'Missing token'})
    
    email = dh.get_email_by_token(token)
    if (email is None or not emailValid(email[0])):
        return json.dumps({'success': False, 'message': 'Incorrect email'})
    
    try:
        dh.get_messages(email[0])
        return json.dumps({'success': True, 'message': 'Messages has been collected'})
    except:
        return json.dumps({'success': False, 'message': 'There is no messages'})

@app.route('/get_user_messages_by_email/<email>', methods=['GET'])
def get_user_messages_by_email(email):
    token = request.headers.get('Authorization')
    if token is None:
        return json.dumps({'success': False, 'message': 'Missing token'})
    
    signed_in = dh.check_signedin(token)
    if signed_in == False:
        return json.dumps({'success': False, 'message': 'Not logged in'})
    
    if dh.get_user_by_email(email) is None:
        return json.dumps({'success': False, 'message': 'User data has not been found'})

    if (email is None or not emailValid(email)):
        return json.dumps({'success': False, 'message': 'Incorrect email'})

    try:
        dh.get_messages(email)
        return json.dumps({'success': True, 'message': 'Messages has been collected'})
    except:
        return json.dumps({'success': False, 'message': 'There is no messages'})

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
        return json.dumps({'success': False, 'message': 'No inputs'})
    elif auth is None:
        return json.dumps({'success': False, 'message': 'Not logged in'})
    
    email = dh.get_email_by_token(auth)

    if email is None:
        return json.dumps({'success': False, 'message': 'Not logged in'})
    elif not ('oldpassword' in data or 'newpassword' in data):
        return json.dumps({'success': False, 'message': 'Missing inputs'})
    elif not isinstance(data['newpassword'], str) or len(data['newpassword']) < 6:
        return json.dumps({'success': False, 'message': 'Password too short'})
    elif not dh.check_password(email[0], data['oldpassword']):
        return json.dumps({'success': False, 'message': 'Wrong password'})
    
    try:
        dh.change_password(email, data['newpassword'])
        return json.dumps({'success': True, 'message': 'Password changed'})
    except:
        return json.dumps({'success': False, 'message': 'Something went wrong'})
    
if __name__ == '__main__':
    dh.init_db()
    app.debug = True
    app.run()