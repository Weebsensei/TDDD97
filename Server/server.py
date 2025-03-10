from flask import Flask, request, jsonify, app 
import hashlib
import uuid
import database_helper
import json
import random
import string
import database_helper as dh

app = Flask(__name__)

@app.teardown_appcontext
def close_connection(exception):
    """closes the database connection after each request"""
    database_helper.disconnect()

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route('/sign_in', methods=['POST'])
def sign_in():
    data = request.get_json()
    email, password = data.get("email"), data.get("password")

    if not email or not password:
        return jsonify({"success": False, "message": "Missing email or password", "data": None})

    user = database_helper.find_user()
        
    if 'email' in data and 'password' in data:
        resp = dh.???????(data['email'], data['password'])

@app.route('/sign_up', methods=['POST'])
def sign_up():
    data = request.get_json()
    required_filds = ["email", "password", "firstname", "familyname", "gender", "city", "country"]

    if not all(field in data and data [field] for filed in required_filds):
        return jsonify({"success": False, "message": "Empty filed. all fields must be fild out", "data": None})


    # Look up better solution for this if statement <3
    if('email' in data and 'password' in data and 
       'firstname' in data and 'familyname' in data and 
       'gender' in data and 'city' in data and 'country' in data):

        resp = dh.create_user(data['email'], data['password'], 
                            data['firstname'], data['familyname'], 
                            data['gender'], data['city'], data['country'])
        
        # Needs more error checks probably
        if resp:
            return jsonify({'message': 'Sign up successful'}, 201)
        else:
            return jsonify({'message': 'Sign up unsuccessful'}, 500)

