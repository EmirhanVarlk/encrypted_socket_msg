from datetime import datetime
from time import sleep
import requests
import socketio
from threading import *
import os
import myencoder
import signer

now=datetime.now()
now = now.strftime("%D, %H:%M:%S")

rsasignkey=signer.rsakeygen()

def cls():
    os.system('cls || clear')    

socket = socketio.Client()

baseUrl = "http://localhost:5001"

def register():
    username = input("Username: ")
    password = input("Password: ")
    response = requests.post(baseUrl + "/api/auth/register", data = { "username": username, "password": password })
    title = response.json()["title"]
    message = response.json()["message"]
    print(title)
    if (response.status_code == 400):
        print(message)
    sleep(1.3)

def login():
    global username
    username = input("Username: ")
    password = input("Password: ")
    response = requests.post(baseUrl + "/api/auth/login", data = { "username": username, "password": password })
    title = response.json()["title"]
    message = response.json()["message"]
    print(title)
    if (response.status_code == 401):
        print(message)
        sleep(1.3)
    elif (response.status_code == 200):
        token = response.json()["token"]
        try:
            room = input("Room: ")
            cls()
            socket.connect(baseUrl + '?room=' + room, headers={ "Authorization": "Bearer " + token })
            socket.wait()
        except Exception as e:
            pass

@socket.event
def connect():
    print("Connected")
    thread = Thread(target = sendMessage)
    thread.start()

@socket.event
def unauthorized(error):
    if (error.data.type == "UnauthorizedError" or error.data.code == "invalid_token"):
        print("User token has expired")

@socket.event
def disconnect():
    print("I am disconnected")

def sendMessage():
    while(True):
        message = input(username + "> ")
        if(message=="!q"):
            socket.disconnect()
            break
        message="("+str(now)+") "+message
        signedMsg=signer.sign(myencoder.encode(message, str(SecK)), rsasignkey)
        #print(signedMsg)
        socket.emit("send-message", { "message": myencoder.encode(message, str(SecK)), "sign": signedMsg })

@socket.event
def message(username, message):
    print(list(username.values())[0], ": ", myencoder.decode(list(message.values())[0], str(SecK)))

@socket.event
def pkey(p,g):
    global P
    global G
    P=p
    G=g
    global PK
    PK=myencoder.createPrivateKey(P)
    calculatePubKey()

def calculatePubKey():
    global PubK
    PubK = pow(G, PK) % P
    socket.emit('publishPubK',  { "pubK": PubK, "rsapubkey": rsasignkey.public_key().export_key() })
    #print("\n\n RSA PUBLİC KEY =>\n",rsasignkey.public_key().export())

@socket.event
def publishPubK(pubK):
    generateSecret(pubK)

def generateSecret(pubKey):
    global SecK
    SecK = pow(pubKey, PK) % P
    print(SecK)

while (True):
    cls()
    print("1- Login")
    print("2- Register")
    choice = input("Choice: ")
    if (choice == "1"):
        token = login()
    else:
        register()