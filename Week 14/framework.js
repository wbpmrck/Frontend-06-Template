export function createElement(type,attributes,...children){
  let element  = null;

  if(typeof type === "string")
    element = new ElementWrapper(type);
  else
    element = new type;

  if(attributes){
    for(let name in attributes){
      element.setAttribute(name,attributes[name]);
    }
  }

  if(children){
    for(let child of children){
      if(typeof child === "string"){
        child = new TextWrapper(child);
      }
      element.appendChild(child);
    }
  }
  return element;
}

export class Component {

  constructor(type){
  }

  setAttribute(name,value){
    this.root.setAttribute(name,value)
  }
  appendChild(child){
    child.moutTo(this.root);
  }
  moutTo(parent){
    parent.appendChild(this.root);
  }
}
class ElementWrapper extends Component{
  constructor(type){
    this.root = document.createElement(type);
  }

}
class TextWrapper extends Component{
  constructor(content){
    this.root = document.createTextNode(content);
  }
}