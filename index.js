// const express = require('express');
// const http = require('http');
// const WebSocket = require('ws');
// const app = express();
// const connection = http.createServer(app);
// // const wss = new WebSocket.Server({ server });
// const server = new WebSocket.Server(connection);

// server.on('connection', (socket, request) => {
//   const userId = new URLSearchParams(request.url).get('userId');
//   console.log(`WebSocket connection established for user ${userId}`);

//   socket.on('message', (message) => {
//     console.log(`Received message from user ${userId}: ${message}`);
//   });

//   socket.on('close', () => {
//     console.log(`WebSocket connection closed for user ${userId}`);
//   });
// });

//   app.get('/', (req, res) => {
//     res.send('Hello, World!');
//   });
  
//   app.listen(3000, () => {
//     console.log('Server listening on port 3000');
//   });


const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const url = require('url');
const corsOptions = {
  origin: 'http://localhost:4200/'
};

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

//  -------------- socket part -------------

wss.on('connection', (socket,request) => {

  const userDetail = url.parse(request.url, true).query;
  const userId = userDetail.userId;
  socket.id = userId;
  console.log(`WebSocket connection established for user ${userId}`)


  // ws.on('message', function message(data, isBinary) {
  //   wss.clients.forEach(function each(client) {
  //     if (client.readyState === WebSocket.OPEN) {
  //       client.send(data, { binary: isBinary });
  //     }
  //   });
  // });
  socket.on('message', (message) => {
    // console.log(`Received message from user ${userId}: ${message}`);
    let Message = JSON.parse(message)
    // socket.send(message);

    // -------- for normal message type --------
    // {
    //   fromUserName:'',
    //   toUserName:'',
    //   fromUserId:'',
    //   toUserId:'',
    //   msgType:'NORMAL', // for now it is normal messag for chat is should be other types like meeting,meetingroom etc,.
    //   msgContent:msg,
    //   dateofsended:new Date()
    // }
    switch (Message.msgType)
    {
      case 'NORMAL':
        wss.clients.forEach(function each(client) {
          if(Message.toUserId == client.id)
          {
            if(client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(Message), { binary: false });
            }
          }
      });
        // wss.clients.forEach(client => {
        //   console.log(Message.toUserId, client.id)
        //   client.send(Message, { binary: false });
        //   if(Message.toUserId == client.id)
        //   {
        //     if(client.readyState === WebSocket.OPEN) {
        //       client.send(JSON.stringify(Message), { binary: false });
        //     }
        //   }
        // }); 
      break;

      default :
      wss.clients.forEach(client => {
        if(Message.toUserId == client.id)
        {
          if(client.readyState === WebSocket.OPEN) {
            client.send(Message, { binary: false });
          }
        }
      }); 
      break;
    }


  });

  socket.on('close', () => {
    console.log(`WebSocket connection closed for user ${userId}`);
  });
});


// ------------- server part --------------

app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});

function validate(req, res, next) {
 
}