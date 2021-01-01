const net =require("net"); //因为模拟http，所以不直接使用http库，而是使用tcp库
const parser = require("./parser");

const render = require("./render.js");
const images = require("images");


class ChunkedBodyParser {
  constructor(){
    this.WAITING_LENGTH = 0;
    this.WAITING_LENGTH_LINE_END = 1;
    this.READING_CHUNK = 2;
    this.WAITING_NEW_LINE = 3;
    this.WAITING_NEW_LINE_END = 4;
    this.length = 0;
    this.content = [];
    this.isFinished = false;
    this.current = this.WAITING_LENGTH;
  }

  receiveChar(char){
    if(this.current === this.WAITING_LENGTH){
      if(char === '\r'){
        if(this.length === 0){
          this.isFinished = true;
        }
        this.current  = this.WAITING_LENGTH_LINE_END;
      }else{
        this.length *= 16; //chunked返回的第一个是16进制的长度数字,所以在接收新的长度字符时，需要把已有的左移1位，也就是乘以16
        this.length += parseInt(char,16); //把新读入的16进制长度加上
      }
    }else if(this.current === this.WAITING_LENGTH_LINE_END){
      if(char === '\n'){
        this.current = this.READING_CHUNK;
      }
    }else if(this.current === this.READING_CHUNK){

      this.content.push(char);
      this.length --;
      if(this.length === 0){
        this.current = this.WAITING_NEW_LINE;
      }
    }else if(this.current === this.WAITING_NEW_LINE){
      if(char === '\r'){
        this.current = this.WAITING_NEW_LINE_END;
      }
    }else if(this.current === this.WAITING_NEW_LINE_END){
      if(char === '\n'){
        this.current = this.WAITING_LENGTH;
      }
    }
  }
}

class ResponseParser {
  constructor(){

    this.WAITING_STATUS_LINE = 0;
    this.WAITING_STATUS_LINE_END = 1;
    this.WAITING_HEADER_NAME = 2;
    this.WAITING_HEADER_NAME_SPACE = 3;
    this.WAITING_HEADER_VALUE = 4;
    this.WAITING_HEADER_LINE_END = 5;
    this.WAITING_HEADER_BLOCK_END = 6;
    this.WAITING_BODY = 7;

    this.current = this.WAITING_STATUS_LINE;
    this.statusLine = "";
    this.headers = {};
    this.headerName = "";
    this.headerValue = "";
    this.bodyParser = null;

  }

  get isFinished(){
    return this.bodyParser && this.bodyParser.isFinished;
  }
  get response(){
    this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);

    return {
      statusCode:RegExp.$1,
      statusText:RegExp.$2,
      headers:this.headers,
      body:this.bodyParser.content.join('')
    }
  }

  receive(string){
    for(let i = 0 ;i < string.length; i++){
      this.receiveChar(string.charAt(i));
    }
  }
  receiveChar(char){
    if(this.current === this.WAITING_STATUS_LINE){
      if(char === '\r'){
        this.current = this.WAITING_STATUS_LINE_END;
      }else{
        this.statusLine += char;
      }
    }else if(this.current === this.WAITING_STATUS_LINE_END){
      if(char === '\n'){
        this.current = this.WAITING_HEADER_NAME;
      }
    }else if(this.current === this.WAITING_HEADER_NAME){
      if(char === ':'){
        this.current = this.WAITING_HEADER_NAME_SPACE;
      }else if(char === '\r'){
        this.current = this.WAITING_HEADER_BLOCK_END;
        if(this.headers["Transfer-Encoding"] === "chunked") //因为node.js的httpServer返回的encoding就是Chunked,所以我们先处理这种
          this.bodyParser = new ChunkedBodyParser();
      }else{
        this.headerName += char;
      }
    }else if(this.current === this.WAITING_HEADER_NAME_SPACE){
      if(char === ' '){
        this.current = this.WAITING_HEADER_VALUE;
      }
    }else if(this.current === this.WAITING_HEADER_VALUE){
      if(char === '\r'){
        this.current = this.WAITING_HEADER_LINE_END;
        this.headers[this.headerName] = this.headerValue;
        this.headerName = "";
        this.headerValue = "";
      }else {
        this.headerValue += char;
      }
    }else if(this.current === this.WAITING_HEADER_LINE_END){
      if(char === '\n'){
        this.current = this.WAITING_HEADER_NAME;
      }
    }else if(this.current === this.WAITING_HEADER_BLOCK_END){
      if(char === '\n'){
        this.current = this.WAITING_BODY;
      }
    }else if(this.current === this.WAITING_BODY){
      this.bodyParser.receiveChar(char); //调用专门的bodyParser去处理body部分的解析
    }
  }
}

class Request {
  constructor(options){
    this.method = options.method || "GET";
    this.host = options.host || "127.0.0.1";
    this.port = options.port || 80;
    this.path = options.path || "/";
    this.headers = options.headers || {};
    this.body = options.body || {};
    if(!this.headers["Content-Type"]){
      this.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
    if(this.headers["Content-Type"] === "application/json")
      this.bodyText = JSON.stringify(this.body);
    else if(this.headers["Content-Type"] === "application/x-www-form-urlencoded")
      this.bodyText = Object.keys(this.body).map(key =>`${key}=${encodeURIComponent(this.body[key])}`).join("&")
    
      this.headers["Content-Length"] = this.bodyText.length;
  }

  toString(){
    return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key =>`${key}:${this.headers[key]}`).join("\r\n")}\r
\r
${this.bodyText}`
  }

  send(connection){
      return new Promise((resolve,reject) => {
        const parser = new ResponseParser;
        if(connection){
          connection.write(this.toString())
        }else {
          connection = net.createConnection({
            // host:this.host,
            port:this.port,
          },() => {
            let data = this.toString();
            connection.write(data);
          })
        }
        connection.on("data",data => {
          console.log('data:')
          console.log(data.toString());
          parser.receive(data.toString());
          if(parser.isFinished){
            resolve(parser.response);
            connection.end();
          }
        });

        connection.on("error",err => {
          reject(err);
          connection.end();
        })
      })
  }
}

try{

  void async function(){
    let request = new Request({
      method:"POST",
      host:"127.0.0.1",
      port:8088,
      path:"/",
      headers:{
        ["X-Foo2"]:"custmized"
      },
      body:{
        name:"wbpmrck"
      }
    });
  
    let response = await request.send();
    console.log(`response is :`);
    console.log(response);
    let dom  = parser.parseHTML(response.body);
    
    let viewport = images(800,600);
    render(viewport,dom); //先单独绘制一个元素(TODO:截图里画的是#myid,视频里画的是.c1)

    viewport.save("viewport.jpg");

  }();
}catch(err){
  console.error(err);
}
