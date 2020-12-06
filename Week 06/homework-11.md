# 找出js中具有特殊行为的对象

## 解

- Array：Array 的 length 属性根据最大的下标自动发生变化。
- Object.prototype：无法再给它设置原型。
- String：支持下标运算，String 的正整数属性访问会去字符串里查找。
- Arguments：arguments 的非负整数型下标属性跟对应的变量联动。
