const EOF = Symbol("EOF");


//初始状态。之所以叫做data是因为 whatwg 标准里是这样定义的：
function data(c){

}

module.exports.parseHTML = function(html){
  let state = data; //初始状态
  for(let c of html){
    state = state(c)
  }
  state = state(EOF); // 为了防止页面本身没有结束符，这里人工加一个结束符
}