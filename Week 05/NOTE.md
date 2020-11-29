# 学习笔记

> 这里会记录一些上课的心得感想

## 心得记录

### 01.关于reactive的实现思路

- 在`effect`函数运行过程中，通过proxy对象的get方法，收集`effect`中依赖于哪些对象的属性
- 为了支持`对象的子对象的响应式`，则需要递归的对proxy的子属性进行`reactive`处理
- 为了避免生成重复的`proxy对象`，为每个proxy对象建立缓存

### 02.关于双向绑定的实现思路

- 通过监听`input`元素的事件，去修改proxy对象的属性，从而触发reactivity,执行effect内部的function
- 通过在`effect`函数中获取po的属性去更新`input`元素的value,让reactivity收集到依赖关系，从而在po属性发生变化的时候自动更新input

### 03.关于Range API的insertNode

在最后一个练习中，我们看到使用了Range.insertNode来将`拖拽节点`插入到目标位置，但是却没有看到将拖拽节点从原来的位置移除的操作，为什么可以这样操作呢，答案就在`Range.insertNode`里其实做了这样的处理，我们看一下whatwg的标准怎么定义的：

``` text

To insert a node node into a live range range, run these steps:

1.If range’s start node is a ProcessingInstruction or Comment node, is a Text node whose parent is null, or is node, then throw a "HierarchyRequestError" DOMException.
2.Let referenceNode be null.
3.If range’s start node is a Text node, set referenceNode to that Text node.
Otherwise, set referenceNode to the child of start node whose index is start offset, and null if there is no such child.
4.Let parent be range’s start node if referenceNode is null, and referenceNode’s parent otherwise.
5.Ensure pre-insertion validity of node into parent before referenceNode.
6.If range’s start node is a Text node, set referenceNode to the result of splitting it with offset range’s start offset.
7.If node is referenceNode, set referenceNode to its next sibling.

8.If node’s parent is non-null, then remove node. //这里定义了node的父亲不为空的逻辑

9.Let newOffset be parent’s length if referenceNode is null, and referenceNode’s index otherwise.
10.Increase newOffset by node’s length if node is a DocumentFragment node, and one otherwise.
11.Pre-insert node into parent before referenceNode.
12.If range is collapsed, then set range’s end to (parent, newOffset).

```

所以实际上我们在使用这个API的时候完全不需要考虑被插入的节点是不是已经在文档里了
## 作业(**必做**)

### 01-完成课程页面底下练习，提交至课程页面

`已完成`
