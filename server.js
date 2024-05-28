const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors = require('cors');
const bodyParser = require('body-parser');
const { SECRET, getUserByUsername, getUsersByRoom, login, register } = require('./user-service');
var socketioJwt = require('socketio-jwt');
const helman = require('./helman')
const crypto = require('crypto')

const PORT = process.env.PORT || 5001



// console.log(console.log(require('crypto').randomBytes(32).toString('hex'))); // SECRET bununla üretildi

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

io.use(socketioJwt.authorize({
    secret: SECRET,
    handshake: true,
    auth_header_required: true
}));

const P = helman.gen_P();
const G = helman.gen_G(P);
const PK = Math.floor(Math.random() * P);
const PubK = Math.pow(G, PK) % P

io.on('connection', (socket) => {

    // console.log(socket.decoded_token.data); // token içindeki bilgilere erişmek için

    var user = getUserByUsername(socket.decoded_token.data.username);
    user.socketId = socket.id;
    user.socket = socket;
    user.room = socket.handshake.query.room;
    socket.join(user.room);
    socket.emit('pkey', P, G)
    socket.on('publishPubK', ({ pubK, rsapubkey }) => {
        socket.emit('publishPubK', PubK);
        user.secret = Math.pow(pubK, PK) % P;
        
        const publickKeyObject = crypto.createPublicKey(rsapubkey);
        rsapubkey=publickKeyObject.export({ format: 'pem', type: 'pkcs1' });
        //console.log(rsapubkey);
        user.rsapubkey=rsapubkey;
    })


    socket.on('send-message', ({ message, sign }) => {
        compMsg=message;
        verifier = crypto.createVerify("RSA-SHA256");
        //console.log("SİGN => ", sign);
        var sign = Buffer.from(sign.toString(), 'base64');
        //console.log("Decoded sign => \n",sign);
        verifier.update(compMsg);
        verifier.end();
        isverified = verifier.verify(user.rsapubkey, sign);
        console.log("\nVerified? = \n", isverified);
        const users = getUsersByRoom(user.room);
        if(!isverified){
            users.forEach(u => {
                if ( u.socket && u.socket.connected ) {
                    u.socket.emit('message', { username: user.username }, { message: "Couldn't recognize the signature of this message." });
                }
            });
        }
        else{
            const msg = helman.decode(message, user.secret);
            
            users.forEach(u => {
                if (u.socket && u.socket.connected && user.username!=u.username ) {
                    u.socket.emit('message', { username: user.username }, { message: helman.encode(msg, u.secret) });
                }
            });
            //socket.in(user.room).emit('message', { username: user.username }, message);
        }
    })

    socket.on("disconnect", (reason) => {
        user.socketId = null;
        user.socket = null;
        user.token = null;
        user.room = null;
    });
})

app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;
    const { error } = register({ username, password });
    if (error) {
        res.status(400).json({ title: "Registration Unsuccessful", message: error });
        return;
    }
    res.status(200).json({ title: "Registration Successful", message: null });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const { token, error } = login({ username, password });
    if (error) {
        res.status(401).json({ title: "Login Error", message: error });
        return;
    }
    res.status(200).json({ title: "Login Successful", message: null, token });
});

http.listen(PORT, () => {
    console.log(`Listening to ${PORT}`);
});
