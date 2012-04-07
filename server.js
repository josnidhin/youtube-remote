var http = require('http')
  , app = http.createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , url = require('url')
  , clients = {}
  , clientsReverse = {}
  , controls = {}
  , controlsReverse = {}
  
app.listen(8080);

function handler (req, res) {
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  var pathname = url_parts.pathname;
  
  if(pathname == '/') {
    ouput_html(res, "index.html");
  } else if(pathname == '/remote.html'){
      ouput_html(res, "remote.html");
  } else {
    res.writeHead(404);
    res.end();
  }
  
}

function ouput_html(res, filename) {
  fs.readFile(__dirname + '/' + filename,
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }
      res.writeHead("Content-Type", "text/html")
      res.writeHead(200);
      res.end(data);
    }
  );
}

var randomID= function() {
  var from = 1000;
  var to = 9999;
  return Math.floor(Math.random()*(to-from+1)+from);
}

io.sockets.on("connection", function(socket){
  socket.on("screen_connect", function(data, fn){
    var id = data.screen_id;
    if(id in clients){
      if(! (id in controlsReverse)){
        controlsReverse[id] = socket.id;
        controls[socket.id] = id;
        fn(true);
      } else {
        console.log("#######")
        fn(false);
      }
    } else {
      console.log("*******")
      fn(false);
    }
  });
  
  socket.on("get_id", function(fn){
    var id = randomID();
    while(id in clients) {
      id = randomID();
    }
    clients[id] = true
    socket.join(id);
    fn(id); 
  });
  
  socket.on("msg", function(data){
    var id = controls[socket.id]
    if(clients[id] != null || clients[id] != 'undefined') {
      io.sockets.in(data.screenId).emit("msg", data);
    }
  });
});