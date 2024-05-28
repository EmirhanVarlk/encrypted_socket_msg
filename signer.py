from base64 import b64encode
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA
from Crypto.Signature import PKCS1_v1_5

def rsakeygen():
    rsakey=RSA.generate(2048)
    return rsakey


def sign(message, rsakey):
    digest = SHA256.new(message)
    signature = PKCS1_v1_5.new(rsakey).sign(digest)
    rsapubkey=rsakey.public_key()
    print("İs Verified? = ",PKCS1_v1_5.new(rsapubkey).verify(digest, signature))
    #print("İs Verified? = ",verified)
    signature_b64 = b64encode(signature)
    return signature_b64