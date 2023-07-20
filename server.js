const express = require('express')
const app = express()
// const cors = require('cors')
// app.use(cors())
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    
    // Check that roomId is properly defined before calling socket.to(roomId)
    if (roomId) {
      socket.to(roomId).emit('user-connected', userId);
    } else {
      console.log(`Error: roomId not properly defined`);
    }

    // messages
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message)
    }); 

    socket.on('disconnect', () => {
      if (roomId) {
        socket.to(roomId).emit('user-disconnected', userId)
      } else {
        console.log(`Error: roomId not properly defined`);
      }
    });
  });
});

server.listen(process.env.PORT||3030);