const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const users = {};

io.on('connection', (socket) => {
    console.log('🟢 Connected:', socket.id);

    socket.on('set username', (username) => {
        users[socket.id] = username;

        // Gửi thông báo đến các user khác (trừ người mới)
        socket.broadcast.emit('user joined', username);
    });

    socket.on('chat message', (msg) => {
        const username = users[socket.id] || 'Anonymous';
        io.emit('chat message', { username, text: msg.text });
    });

    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            socket.broadcast.emit('user left', username);
        }
        delete users[socket.id];
        console.log('🔴 Disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
