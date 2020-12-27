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
    body #myid {
      width:100px;
      background-color:$ff5000;
    }
    body div img {
      width:30px;
      background-color:$ff1111;
    }
  </style>
</head>
<body>
      <div>
        <img />
      </div>
      <div id="myid"></div>
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