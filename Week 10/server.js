const http = require('http');

http.createServer( (req,resp)=>{
  let body = [];
  req.on('error',err=>{
    console.error(err);
  }).on('data',chunk => {
    console.log(chunk);
    body.push(chunk.toString());
  }).on("end",()=>{
    // body = Buffer.concat(body).toString();
    console.log("body:",body);
    resp.writeHead(200,{"Content-Type":"text/html"});

    resp.end(
`<html lang="en">
<head>
  <style>
    #container {
      width:500px;
      height:300px;
      display:flex;
      background-color: rgb(255,255,255);
    }
    #container #myid{
      width:200px;
      height:100px;
      background-color: rgb(255,0,0);
    }
    #container .c1 {
      flex:1;
      background-color: rgb(0,255,0);
    }
  </style>
</head>
<body>
      <div id="container">
        <div id="myid"></div>
        <div class="c1"></div>
      </div>
</body>
</html>`)

//     resp.end(
// `<html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>这是一个测试页面</title>
// </head>
// <body>
//       <div></div>
// </body>
// </html>
// `)
  })
}).listen(8088);

console.log("server started!")