var url  = require('url');
var http = require('http');

function usage() {
  console.log('node client.js [text|json|csv|jsonUser] [url]');
  process.exit(1);
}

function isURL(str) {
  if (!str)
    return undefined;  
  var u = url.parse(str);
  if (u.protocol !== null)
    return str;
  else
    return undefined;
}

function checkType(type) {
  if (!type) return undefined
  else if (type === 'text' ||
	   type === 'json' ||
     type === 'csv' ||
     type === 'jsonUser')
    return type;
}

function checkURL(str) {
  if (!str) return undefined
  else {
    var u = url.parse(str);
    if (u.protocol !== null)
      return u;
    else
      return undefined;
  }
}

var args = process.argv;
var type = checkType(args[2]) || 'text';
var url  = checkURL(args[3])  || url.parse('http://localhost:8000');

console.log(type);
console.log(url);

// This function is used to receive data being received from the
// server's response. The provided callback has a single argument that
// is passed a string of the received data.
function receive(res, callback) {
  var str = '';

  // When data is received we append to string.
  res.on('data', function (chunk) {
    str += chunk;
  });

  // When the connection is closed, we invoke our callback.
  res.on('end', function () {
    callback(str);
  });  
}

function textHandler(res) {
  receive(res, function (data) {
    console.log('received text: ' + data);
  });
}

function jsonHandler(res) {
  receive(res, function (data) {
    var obj = JSON.parse(data);
    console.log('received json message: ' + obj.msg);
  });
}

//This receives the data from the server,
//converts it into JavaScript object using JSON.parse,
//and prints out data in block
function jsonUserHandler(res){

  receive(res, function(data){
    var obj = JSON.parse(data);
    for(var i=0; i<obj.length-1; i++){
      console.log("\nUser: " + obj[i].uid);
      console.log("First Name: " + obj[i].first_name);
      console.log("Last Name: " + obj[i].last_name);
      console.log("Phone: "+ obj[i].phone);
      console.log("Country: " + obj[i].country);
      console.log("Address: " + obj[i].address);
    }
  });
}

//This handler will be similar to the jsonUserHandler
//except it will generate the CSV data to the console.
//The text that it prints out will look identical to what was 
//contained in the people.csv file on the server.
function csvUserHandler(res){
  receive(res, function(data){
    var obj = JSON.parse(data);
    var header = Object.keys(obj[0]);
    var output = '';
    for(var i = 0; i<header.length; i++){
      output += header[i] + ", ";
    }
    console.log(output);

    for(var i = 0; i<obj.length-1; i++){
      console.log(obj[i].uid + obj[i].first_name + ","
        + obj[i].last_name+ "," + obj[i].phone + "," 
        + obj[i].country +"," + obj[i].address);

    }

  });

}


var handlers = {
  text : textHandler,
  json : jsonHandler, 
  csv : csvUserHandler,
  jsonUser : jsonUserHandler
};

var options = {
  host: url.hostname,
  path: url.path,
  port: url.port || 80,
  method: 'GET'
};

var h   = handlers[type];
var req = http.request(options, h);
req.end();
