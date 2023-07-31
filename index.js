const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const url = require('url');
const mysql = require('mysql');
const env_con = require('./config') //fetch data's form the config.js

const PORT = process.env.PORT || env_con.port;
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

// ------------- db part -------------- 

// --- now we are using XAMPP server for our database --- 
// --- before start conncetion with xampp
try{
  var connection_data = mysql.createConnection(
    env_con.Db_con // config.js contain db config json
  );
}
catch(err)
{
  console.log(err)
}



// --- open db connection ---
connection_data.connect(function(err) {
  console.log("Connected to XAMPP Server!");
}); 

// ------------------- app code ---------------------
// ------------- server part --------------

// express methods  -- get,post,put,delete
app.post('/create-db', (req, res) => {
  //req --> {db_name:'VMT'}
  try{
    if(req != undefined)
    {
      //sql query to create a database named  facility in XAMPP
      if(req.db_name)
      connection_data.query(`CREATE DATABASE ${req.db_name}`, function (err, result) {
      //Display message in our console.
      console.log("Database-facility is created");
    });
    }
  }
  catch(err)
  { 

  }
  
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});



// -------------------------------
app.use(cors(corsOptions)); // for cross origin resource sharing

app.use(express.json());  // for parsing application/json
// app.use(express.urlencoded({ extended: true }));


server.listen(PORT, () => {
  console.log('Server listening on port',PORT);
});





// ---------------- learing code -------------------  
app.get('/status', (request, response) => {
  const status = {
     'Status': 'Running'
  };
  response.send(status);
});