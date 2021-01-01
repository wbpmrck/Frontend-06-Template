/*
  本小节内容：生成computed属性

  这一步会考虑选择器的优先级

                [inline,     id,     class,     tag]
div div #id       0           1         0         2
div #id1 #id2     0           2         0         1

优先级：
1、从左到右比较，只要大于就更加优先

*/
const { cpuUsage } = require("process");
const css = require("css");

const EOF = Symbol("EOF");
const layout = require("./layout.js");

let currentToken = null; //保存当前解析的token
let currentAttrbute = null; //保存当前解析的属性
let currentTextNode = null; //保存当前的文本节点
let stack = [{type:"document",children:[]}]; //用于构建DOM树的栈结构

let rules = [];//暂存css规则



//根据选择器 计算优先级
//TODO:这里没有考虑解析复合选择器
function specificity(selector){
  let p =[0,0,0,0]; //四元组
  let selectorParts = selector.split(" ");
  for(let part of selectorParts){
    if(part.charAt(0) === "#"){
      p[1] += 1;
    }else if(part.charAt(0) === "."){
      p[2] += 1;
    }else{
      p[3] += 1;
    }
  }
  return p;
}

//比较2个优先级
function compare(sp1,sp2){
  if(sp1[0] - sp2[0])
    return sp1[0] - sp2[0]

  if(sp1[1] - sp2[1])
    return sp1[1] - sp2[1]

  if(sp1[2] - sp2[2])
    return sp1[2] - sp2[2]

    return sp1[3] - sp2[3]
}



function addCSSRules(text){
  let ast = css.parse(text);
  console.log(JSON.stringify(ast,null,"    "));
  rules.push(...ast.stylesheet.rules);
}

//判断一个元素是否符合选择器
//.class 
//#id 
//tagname
// div.a#a  复合选择器
// body img  复杂选择器
function match(element,selector){
  if(!selector || !element.attributes) //没有属性的都是文本节点，也就不需要计算css(永远无法匹配)
    return false;
  
  if(selector.charAt(0) === "#") {
    let attr = element.attributes.filter(attr => attr.name === "id")[0];
    if(attr && attr.value === selector.replace("#",""))
      return true;
  }else if(selector.charAt(0) === ".") {
    let attr = element.attributes.filter(attr => attr.name === "class")[0];
    if(attr && attr.value === selector.replace(".","")) //TODO:这里没有考虑class="c1 c2"这种情况，正常来说需要对空格进行分割处理
      return true;
  }else{
    if(element.tagName === selector){
      return true;
    }
  }

  return false;
}

function computeCSS(element){
  let elements = stack.slice().reverse(); //把栈复制一下，然后倒置。倒置的原因是，css匹配的时候是先匹配当前元素，然后向上寻找父亲元素

  if(!element.computedStyle){
    element.computedStyle = {};
  }

  for(let rule of rules){
    let selectorParts = rule.selectors[0].split(" ").reverse();

    if(!match(element,selectorParts[0]))
      continue
    
    let matched = false;
    var j =1; //表示当前选择器的位置

    for(var i = 0;i < elements.length; i++){ //i表示当前元素的位置
      if(match(elements[i],selectorParts[j])){
        j++;
      }
    }

    if(j >= selectorParts.length)
      matched = true;
    
    if(matched){

      let sp = specificity(rule.selectors[0]);

      var computedStyle = element.computedStyle;
      for(let declaration of rule.declarations){
        if(!computedStyle[declaration.property])
          computedStyle[declaration.property] = {}

        if(!computedStyle[declaration.property].specificity){
          computedStyle[declaration.property].value = declaration.value;
          computedStyle[declaration.property].specificity = sp;
        }else if(compare(computedStyle[declaration.property].specificity,sp)<0){
          computedStyle[declaration.property].value = declaration.value;
          computedStyle[declaration.property].specificity = sp;
        }
      }

      console.log(element.computedStyle);
    }
  }
}

//产生token
function emit(token){
  console.log('emit:',token)
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
    layout(top);

    top.children.push(element);
    // element.parent = top; //TODO:这里的Parent注释之后，stringfy才可以工作

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

      layout(top);
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

//<img />
function afterAttributeName(c){
  if(c.match(/^[\t\n\f ]$/)){
    return beforeAttributeName;
  }else if(c === ">" || c === "/" || c === EOF){
    // return afterAttributeName(c);
      return selfClosingStartTag;
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
    emit(currentToken);
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

  return stack[0];
}