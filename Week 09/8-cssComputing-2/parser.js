/*
  本小节内容：添加css调用（计算css属性）
*/
const { cpuUsage } = require("process");
const css = require("css");

const EOF = Symbol("EOF");

let currentToken = null; //保存当前解析的token
let currentAttrbute = null; //保存当前解析的属性
let currentTextNode = null; //保存当前的文本节点
let stack = [{type:"document",children:[]}]; //用于构建DOM树的栈结构

let rules = [];//暂存css规则

function addCSSRules(text){
  let ast = css.parse(text);
  console.log(JSON.stringify(ast,null,"    "));
  rules.push(...ast.stylesheet.rules);
}

function computeCSS(element){
  console.log(rules);
  console.log("compute css for element:",element);
}

//产生token
function emit(token){
  let top = stack[stack.length-1];

  if(token.type === "startTag"){
    let element = {
      type:"element",
      children:[],
      attributes:[]
    };

    //获取标签名称
    element.tagName = token.tagName;

    //获取属性
    for(let p in token){
      if(p !== "type" && p !== "tagName"){
        element.attributes.push({
          name:p,
          value:token[p]
        });
      }
    }

    computeCSS(element);

    top.children.push(element);
    element.parent = top;

    if(!token.isSelfClosing)
      stack.push(element)

    currentTextNode = null;
  }else if(token.type === "endTag"){
    if(top.tagName !== token.tagName){
      throw new Error("Tag start end doesn't match!")
    }else{
      //遇到style标签时，执行添加css规则的操作
      if(top.tagName === "style"){
        addCSSRules(top.children[0].content); //取出当前style标签的文本内容
      }
      stack.pop(); //配对成功，把元素从栈里取出
    }
    currentTextNode = null;
  }else if(token.type === "text"){
    if(currentTextNode === null){
      currentTextNode = {
        type: "text",
        content:""
      };
      top.children.push(currentTextNode);
    }
    currentTextNode.content += token.content;
  }
}

//初始状态。之所以叫做data是因为 whatwg 标准里是这样定义的：
function data(c){
  if(c === "<"){
    return tagOpen;
  }else if(c === EOF){
    emit({
      type:"EOF"
    })
    return ;
  }else {
    emit({
      type:"text",
      content:c
    })
    return data;
  }
}

//状态：开始标签
function tagOpen(c){
  if(c === "/"){
    return endTagOpen;
  }else if(c.match(/^[a-zA-Z]$/)){
    currentToken = {
      type:"startTag",
      tagName:""
    }
    return tagName(c);
  }else{
    return ;
  }
}

//状态：结束标签开始
function endTagOpen(c){
  if(c.match(/^[a-zA-Z]$/)){
    
    currentToken = {
      type:"endTag",
      tagName:""
    }
    return tagName(c);
    // currentToken = {
    //   type: "endTag"
    // }
  }else if(c === ">"){

  }else if(c === EOF){

  }else {

  }
}

//状态：开始解析标签名称
function tagName(c){
  if(c.match(/^[\t\n\f ]$/)){
    return beforeAttributeName;
  }else if(c === "/"){
    return selfClosingStartTag;
  }else if(c.match(/^[a-zA-Z]$/)){
    currentToken.tagName += c;
    return tagName;
  }
  else if(c === ">"){
    emit(currentToken);
    return data;
  }else {
    return tagName;
  }
}

// <html attr1=xxx
function beforeAttributeName(c){
  if(c.match(/^[\t\n\f ]$/)){
    return beforeAttributeName;
  }else if(c === ">" || c === "/" || c === EOF){
    return afterAttributeName(c);
  }else if(c === "="){
  }else {
    currentAttribute = {
      name:"",
      value:"",
    }
    return attributeName(c);
  }
}
function afterAttributeName(c){
  if(c.match(/^[\t\n\f ]$/)){
    return beforeAttributeName;
  }else if(c === ">" || c === "/" || c === EOF){
    return afterAttributeName(c);
  }else if(c === "="){
  }else {
    currentAttribute = {
      name:"",
      value:"",
    }
    return attributeName(c);
  }
}
function attributeName(c){
  if(c.match(/^[\t\n\f ]$/) || c === ">" || c === "/" || c === EOF){
    return afterAttributeName(c);
  }else if(c === "="){
    return beforeAttributeValue
  }else if(c === "\u0000"){

  }else if(c === "\"" || c === "'" || c === "<"){

  }else {
    currentAttribute.name += c;
    return attributeName;
  }
}

function beforeAttributeValue(c){
  if(c.match(/^[\t\n\f ]$/) || c === ">" || c === "/" || c === EOF){
    return beforeAttributeValue;
  }else if(c === "\""){
    return doubleQuotedAttributeValue
  }else if(c === "\'"){
    return singleQuotedAttributeValue
  }else if(c === ">"){

  }else {
    return UnquotedAttributeValue(c)
  }
}

function doubleQuotedAttributeValue(c){
  if(c === "\""){
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuetedAttributeValue;
  }else if(c === "\u0000"){

  }else if(c === EOF){
    
  }else{
    currentAttribute.value += c;
    return doubleQuotedAttributeValue
  }
}

function singleQuotedAttributeValue(c){
  if(c === "\'"){
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuetedAttributeValue;
  }else if(c === "\u0000"){

  }else if(c === EOF){
    
  }else{
    currentAttribute.value += c;
    return singleQuotedAttributeValue
  }
}

function afterQuetedAttributeValue(c){
  if(c.match(/^[\t\n\f ]$/)){
    return beforeAttributeName
  }else if(c === "/"){
    return selfClosingStartTag;
  }else if(c === ">"){
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  }else if(c === EOF){
    
  }else{
    currentAttribute.value += c;
    return afterQuetedAttributeValue;//doubleQuotedAttributeValue
  }
}

function UnquotedAttributeValue(c){

  if(c.match(/^[\t\n\f ]$/)){
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName
  }else if(c === "/"){
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfClosingStartTag;
  }else if(c === ">"){
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  }else if(c === "\u0000"){
    
  }else if(c === "\"" || c === "'" || c === "<" || c === "=" || c === "`"){
    
  }else if(c === EOF){
    
  }else{
    currentAttribute.value += c;
    return UnquotedAttributeValue
  }
}

// </div>
function selfClosingStartTag(c){
  if(c === ">"){
    currentToken.isSelfClosing = true;
    return data;
  }else if(c === EOF){
  }else {
  }
}

module.exports.parseHTML = function(html){
  let state = data; //初始状态
  for(let c of html){
    state = state(c)
  }
  state = state(EOF); // 为了防止页面本身没有结束符，这里人工加一个结束符

  console.log(stack[0]);
}