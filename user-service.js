const jwt = require('jsonwebtoken');

const SECRET = "8e19fe50dd0680405634c0c84a40304813d90e679a24b0dc729f7b3ca137b296";

const users = [{
    socket: null,
    socketId: null,
    username: "a",
    password: "1",
    token: null,
    room: null,
    secret: null
}];

const getNewUser = ({ username, password }) => {
    return {
        socket: null,
        socketId: null,
        username,
        password,
        token: null,
        room: null,
        secret: null
    };
};

const register = ({ username, password }) => {
    const trimmedPassword = password.trim();
    const trimmedUsername = username.trim();
    const foundUser = users.find(u => u.username == trimmedUsername);
    if (foundUser) return { error: "Username has already been taken" };
    if (trimmedUsername.length<8 || trimmedPassword.length<8) return { error: "Username or password is shorter than 8 characters"};
    if (!username) return { error: "Username is required" };
    if (!password) return { error: "Password is required" };
    users.push(getNewUser({ username: trimmedUsername, password: trimmedPassword }));
    return { error: null };
};

const login = ({ username, password }) => {
    let foundUser = users.find(u => u.username == username && u.password == password);
    if (!foundUser) return { error: "Wrong username or password" };
    if (foundUser.token) return { error: "User already logged in" };
    
    const token = jwt.sign({
        data: { username, unq: Date.now() } // token oluşturulması içerisindeki bilgiler benzersiz olsun diye benzersiz şeyler...
    }, SECRET, { expiresIn: '60000' });
    foundUser.token = token;

    return { token };
}

const getUserByUsername = (username) => {
    return users.find(u => u.username == username);
}

const getUsersByRoom = (room) => {
    return users.filter(u => u.room == room);
}

module.exports = { SECRET, getUserByUsername, getUsersByRoom, login, register };
