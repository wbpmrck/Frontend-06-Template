# 学习笔记

> 这里会记录一些上课的心得感想

## 心得记录

### 01.flex布局基础

Flexible Box 模型，通常被称为 flexbox，是一种一维的布局模型。它给 flexbox 的子元素之间提供了强大的空间分布和对齐能力

#### flexbox 的两根轴线

当使用 flex 布局时，首先想到的是两根轴线 — 主轴和交叉轴。主轴由 `flex-direction` 定义，另一根轴垂直于它。我们使用 `flexbox` 的所有属性都跟这两根轴线有关, 所以有必要在一开始首先理解它。

**主轴：**

主轴由 `flex-direction` 定义，可以取4个值：

- row
- row-reverse
- column
- column-reverse

如果你选择了`row`或者`row-reverse`，你的主轴将沿着 inline 方向延伸。

![](./res/Basics1.png)

选择`column`或者`column-reverse`时，你的主轴会沿着上下方向延伸 — 也就是`block`排列的方向。

![](./res/Basics2.png)

**交叉轴：**

交叉轴垂直于主轴，所以如果你的`flex-direction `(主轴) 设成了 `row` 或者 `row-reverse` 的话，交叉轴的方向就是沿着列向下的

![](./res/Basics3.png)

如果主轴方向设成了 column 或者 column-reverse，交叉轴就是水平方向。

![](./res/Basics4.png)

理解主轴和交叉轴的概念对于对齐 flexbox 里面的元素是很重要的；flexbox 的特性是沿着主轴或者交叉轴对齐之中的元素。

**起始线和终止线：**

另外一个需要理解的重点是 `flexbox` 不会对文档的书写模式提供假设。过去，CSS的书写模式主要被认为是水平的，从左到右的。现代的布局方式涵盖了书写模式的范围，所以我们不再假设一行文字是从文档的左上角开始向右书写, 新的行也不是必须出现在另一行的下面。

如果 `flex-direction` 是 `row` ，并且我是在书写英文，那么主轴的起始线是左边，终止线是右边。

![](./res/Basics5.png)

如果我在书写阿拉伯文，那么主轴的起始线是右边，终止线是左边。

![](./res/Basics6.png)

在这两种情况下，交叉轴的起始线是flex容器的顶部，终止线是底部，因为两种语言都是水平书写模式

### 02.toyBrowser没有考虑的部分

#### 文本的渲染

文本的渲染需要考虑不同的字体、大小，字体的对齐、换行等部分
#### 元素的边框和内外边距

元素的边框绘制、内外边距的绘制，以及和`box-sizing`不同取值之间的关系，都会互相影响
#### 不同的长度单位支持

目前的版本仅仅考虑了`px`,还有很多其他单位比如:

- vw,vh
- rem
- %


#### z-index对绘制的影响

如何根据元素所在的层级决定绘图的优先级，以及对性能的影响，也是需要考虑的

## 作业(**必做**)
### 01-完成课上练习，提交至Github

`已完成`

> 运行作业的步骤：
> - 先运行/server.js
> - 然后运行xxx/client.js(不同文件夹的client.js是一样的，只是parser/render不一样)
> - 不同的parser.js，完成度不同，最后一个parse.js最完整