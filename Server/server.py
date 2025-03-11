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
        return re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email)

def make_token():
    # token = ''
    # for i in range(36):
    #     token
    return ''.join(random.choice(string.ascii_letters + string.digits) for i in range(36))

@app.teardown_appcontext
def close_connection(exception):
    """closes the database connection after each request"""
    dh.disconnect_db()

@app.route("/")
def hello_world():
    dh.print_db()
    return "<p>Hello, World!</p>"

@app.route('/sign_in', methods=['POST'])
def sign_in():
    data = request.get_json()

    if data is None:
        return json.dumps({'success': False, 'message': 'No inputs'})
    elif not ('username' in data or 'password' in data):
        return json.dumps({'success': False, 'message': 'Missing inputs'})
    elif not (exists(data['username'])):
        return json.dumps({'success': False, 'message': 'Wrong email'}) # Error should be "Wrong email or password"
    elif not emailValid(data['username']):
        return json.dumps({'success': False, 'message': 'Email is not valid'})
    elif not dh.check_password(data['username'], data['password']):
        return json.dumps({'success': False, 'message': 'Wrong Password'}) # Error should be "Wrong email or password"

    token = make_token()
    print(token)
    if dh.sign_in(token, data['username']):
        return json.dumps({'success': True, 'message': 'Successfully signed in', 'data': token})
    else:
        return json.dumps({'success': False, 'message': 'Something went wrong? UWU'})


def exists(email):
    user = dh.get_user_by_email(email)
    if user == None:
        result = False
    else:
        result = True
    return result

@app.route('/sign_up', methods=['POST'])
def sign_up():
    data = request.get_json()
    if data is None:
        return json.dumps({'success': False, 'message': 'No inputs'})

    elif not('email' in data or 'password' in data or 
          'firstname' in data or 'familyname' in data or 
          'gender' in data or 'city' in data or 
          'country' in data or len(data['password'])>=6):
        return json.dumps({'success': False, 'message': 'Missing input'})

    elif (exists(data['email'])):
        return json.dumps({'success': False, 'message': 'User already exists'}) 

    elif not emailValid(data['email']):
        return json.dumps({'success': False, 'message': 'Email is not valid'})
    
    if dh.create_user(data['email'], data['password'], 
                      data['firstname'], data['familyname'], 
                      data['gender'], data['city'], data['country']):
        return json.dumps({'success': True, 'message': 'new user added successfully'})
    else:
        return json.dumps({'success': False, 'message': 'Something went wrong?'})
  
                

        

    #     return jsonify({'message': ''}, 406)
    # elif not emailValid(data['email']):
    #     return jsonify({'message': 'Email is not valid'}, 501)
    # else:
    #     try:
    #         dh.create_user(data['email'], data['password'], 
    #                        data['firstname'], data['familyname'], 
    #                        data['gender'], data['city'], data['country'])
    #         return jsonify({'message': 'Sign up successful'}, 201)
    #     except:
    #         return jsonify({'message': 'Sign up unsuccessful'}, 500)

if __name__ == '__main__':
    dh.init_db()
    app.debug = True
    app.run()