// Setup basic express server
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const adapter = require("@socket.io/redis-adapter");
const redis = require('ioredis');
const port = process.env.PORT || 3000;
const serverName = process.env.NAME || 'Unknown';
const redis_password = process.env.REDIS_PASSWORD

// 가입 가능한 채널 및 채널에 가입한 사용자 수
// 0 이면 redis의 채널에 가입을 취소함
// 1 이상이면 redis의 채널에 가입하고 데이터를 중계
const channel_status = {
  "channel1": {
      count: 0,
      users: new Set()
  },
  "channel2": {
    count: 0,
    users: new Set()
  },
  "channel3": {
    count: 0,
    users: new Set()
  }
}

const channels = Object.keys(channel_status)
const commands = ["join", "left"]
let help = ""

commands.forEach(item => {
  help += `${item} [${channels.join("|")}]\n`
})

const pubClient = new redis(
  {
    port: 6379, 
    host: "redis", 
    username: "default", // needs Redis >= 6
    password: redis_password,
    db: 0
  }
);

const subClient = pubClient.duplicate();

server.listen(port, function () {
  console.log('Server listening at port %d', port);
  console.log('Hello, I\'m %s, how can I help?', serverName);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Health check
app.head('/health', function (req, res) {
  res.sendStatus(200);
});

// Chatroom

let numUsers = 0;
io.on('connection', function (socket) {
  socket.emit('my-name-is', serverName);

  let addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    console.log(data)

    let commands = data.split(" ")
    
    if(commands[0] === "join" && channel_status[commands[1]] != undefined && !channel_status[commands[1]].users.has(socket.id) ){
      
      if(channel_status[commands[1]].count === 0){
        subClient.subscribe(commands[1], (err) => {
          if(err){
            console.log(`Error: ${err}`)
          }
        })
      }
      channel_status[commands[1]].count ++
      channel_status[commands[1]].users.add(socket.id)


      socket.join(commands[1])
      
      socket.emit('new message', {
        username: "from server",
        message: `Joined ${commands[1]}`
      })
      console.log(`${socket.id} is joined ${commands[1]}`)
    
    } else if(commands[0] === "left" && channel_status[commands[1]] != undefined && channel_status[commands[1]].users.has(socket.id)){
    
      channel_status[commands[1]].count--
      channel_status[commands[1]].users.delete(socket.id)
      if(channel_status[commands[1]].count === 0){
        subClient.unsubscribe(commands[1], (err) => {
          if(err){
            console.log(`Error: ${err}`)
          }
        })
      }
      socket.leave(commands[1])
      
      socket.emit('new message', {
        username: "from server",
        message: `Left ${commands[1]}`
      })
      console.log(`${socket.id} is left ${commands[1]}`)

    } else {
      socket.emit('new message', {
        username: "from server",
        message: `Unsupported Commands "${data}"\n Support Commands: \n ${help}`
      });
    }
  })
  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
  if (addedUser) return;

  // we store the username in the socket session for this client
  socket.username = username;
  ++numUsers;
  addedUser = true;
  socket.emit('login', {
    numUsers: numUsers
  });
  // echo globally (all clients) that a person has connected
  socket.broadcast.emit('user joined', {
    username: socket.username,
    numUsers: numUsers
  });
  });


  // when the user disconnects.. perform this
  socket.on('disconnect', function () {

    channels.forEach(channel => {
      let userJoined = channel_status[channel].users.delete(socket.id)
      if(userJoined){
        console.log(`${socket.username} left ${channel}`)
        channel_status[channel].count--
      }
    });
    if (addedUser) {
      --numUsers;
      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});



// Redis에서 구독된 데이터 수신 처리 
subClient.on("message", (channel, message) => {

      io.to(channel).emit('new pub', {
        username: "from server",
        message: message
      })
});