var http = require('http');
var url  = require('url');
var fs = require('fs');

function usage() {
  console.log('node server.js [text|json|csv]');
  process.exit(1);
}

var args = process.argv;
var type = args[2] || 'text';


function textHandler(req, res) {
  res.writeHead(200, { 'Content-Type' : 'text/plain' });
  res.write('hello, world');
  res.end();
}

function jsonHandler(req, res) {
  res.writeHead(200, { 'Content-Type' : 'text/json' });
  var data = { msg: 'hello, world' };
  var json = JSON.stringify(data);
  res.write(json);
  res.end();
}

/**
*Add a new handler function called csvHandler
*Inside the csvHandler function read the peopel.csv file using fs node.js package.
*For each line in the file convert it into a JavaScript object.
*Add each of those objects into an array named arr
*Convert the array into a JSON object using the JSON.stringify
*method: JSON.parse(arr). Then send that back to the client using 
*response object.
**/


function csvHandler(req, res){

  fs.readFile('people.csv', function(err, contents){

    if(err){
      console.log('there was an error:  '+ err);
    }
    else{
      res.writeHead(200, { 'Content-Type' : 'text/csv' });
      var lines = (contents.toString().split('\n'));
      var arr = [];
      var headers = lines[0].split(',');
      for(var i = 1; i < lines.length; i++) {
        var person = lines[i].split(',');
        var obj = {};
        for(var j = 0; j < person.length; j++) {
             obj[headers[j].trim()] = person[j];
        }
        arr.push(obj);
      }
      res.write(JSON.stringify(arr));
      res.end();
    }
  });
}


var handlers = {
  text : textHandler,
  json : jsonHandler,
  csv : csvHandler
};

var h = handlers[type];

console.log('Running ' + type + ' service on port 8000');
http.createServer(h).listen(8000);
