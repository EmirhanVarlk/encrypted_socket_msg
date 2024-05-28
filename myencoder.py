import random

def encode(data, key):
    cleartext = data
    key = str(key)

    reps = (len(cleartext)-1)//len(key) +1

    a1 = cleartext.encode('utf-8')
    key = (key * reps)[:len(cleartext)].encode('utf-8')
    cipher = bytes([i1^i2 for (i1,i2) in zip(a1,key)])
    return cipher


def decode(data,key):
    key = str(key)
    cipher = data
    reps = (len(cipher)-1)//len(key) +1
    key = (key * reps)[:len(cipher)].encode('utf-8')
    clear = bytes([i1^i2 for (i1,i2) in zip(cipher,key)])
    return clear.decode('utf-8')



#Diffie Hellman 

def createPrivateKey(p):
    return random.randrange(2,p)
 