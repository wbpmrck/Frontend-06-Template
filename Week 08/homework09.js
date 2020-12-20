const http = require('http');

http.createServer( (req,resp)=>{
  let body = [];
  req.on('error',err=>{
    console.error(err);
  }).on('data',chunk => {
    body.push(chunk.toString());
  }).on("end",()=>{
    body = Buffer.concat(body).toString();
    console.log("body:",body);
    resp.writeHead(200,{"Content-Type":"text/html"});
    resp.end("hello world!")
  })
}).listen(8088);

console.log("server started!")