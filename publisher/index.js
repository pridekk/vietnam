// Setup basic express server
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const redis = require('ioredis');
const redis_password = process.env.REDIS_PASSWORD
const port = process.env.PORT || 3000;
const serverName = process.env.NAME || 'Unknown';

const pubClient = new redis(
  {
    port: 6379, 
    host: "redis", 
    username: "default", // needs Redis >= 6
    password: redis_password,
    db: 0
  }
);

server.listen(port, function () {
  console.log('Server listening at port %d', port);
  console.log('Hello, I\'m %s, how can I help?', serverName);
});

// Health check
app.head('/health', function (req, res) {
  res.sendStatus(200);
});

app.post('/publish', (req,res) => {

    console.log(req.body)
    pubClient.publish('data', JSON.stringify({name: "name", data: 1}))
    res.sendStatus(200)
})