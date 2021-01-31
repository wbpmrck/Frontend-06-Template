import {createElement,Component} from "./framework"

class Carousel extends Component {
  constructor(){
    super(); 
    this.attributes = Object.create(null);
  }

  setAttribute(name,value){
    this.attributes[name] = value;
  }
  render(){
    // console.log(this.attributes.src);
    
    this.root = document.createElement("div");
    this.root.classList.add("carousel");
    for(let record of this.attributes.src){
      let child = document.createElement("div");
      child.style.backgroundImage = `url('${record}')`;
      this.root.appendChild(child);
    }


    let position = 0;
    this.root.addEventListener("mousedown",event => {
      
      let children = this.root.children;
      let startX = event.clientX;
      let move = event => {
        let x = event.clientX - startX; //移动的距离

        let current = position - ( (x - x % 500) / 500); 

        for (const offset of [-1,0,1]) {
          let pos = current + offset;
          pos = (pos + children.length)% children.length;
          children[pos].style.transition = "none";
          children[pos].style.transform = `translateX(${-pos * 500 +offset * 500 + x % 500}px)`;
        }

        // for (let child of children) {
        //   child.style.transition = "none";
        //   child.style.transform = `translateX(${-position * 500 +x}px)`;
        // }
  
      }
      let up = event => {
        
        let x = event.clientX - startX; //移动的距离
        position = position - Math.round(x / 500); //如果没有拖拽超过50%的距离，就不切换position
       
        
        // for (const offset of [-1,0,1]) {
        for (const offset of [0,-Math.sign(Math.round(x / 500) - x + 250 * Math.sign(x))]) {
          let pos = position + offset;
          pos = (pos + children.length)% children.length;
          children[pos].style.transition = "";
          children[pos].style.transform = `translateX(${-pos * 500 +offset * 500 }px)`;
        }

        document.removeEventListener("mousemove",move);
        document.removeEventListener("mouseup",up);
      }
      document.addEventListener("mousemove",move)
      document.addEventListener("mouseup",up)

    })

    // let currentIndex = 0;
    // setInterval(()=>{
    //   let children = this.root.children;
    //   let nextIndex = (currentIndex+1) % children.length;
      
    //   let current = children[currentIndex];
    //   let next = children[nextIndex];

    //   //下面两句，把next先偷偷重置回等待出现的位置（滚动区域右侧）
    //   next.style.transition = "none";
    //   next.style.transform  = `translateX(${100 - nextIndex * 100}%)`

    //   //下一帧进行目标位置的设置
    //   setTimeout(()=>{
    //     next.style.transition = "";
    //     current.style.transform  = `translateX(${-100 - currentIndex * 100}%)`
    //     next.style.transform  = `translateX(${- nextIndex * 100}%)`
    //     currentIndex = nextIndex;
    //   },16)
    //   // for (let child of children) {
    //   //   child.style.transform = `translateX(-${current * 100}%)`
    //   //   console.log('set style=',`translateX(-${current * 100}%)`)
    //   // }
    // },3000);

    return this.root;
  }
  moutTo(parent){
    parent.appendChild(this.render())
  } 
}

let d = [
  "https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg",
  "https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg",
  "https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg",
  "https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg"
]

let a=<Carousel src={d}/>;

// document.body.appendChild(a1);
a.moutTo(document.body)
