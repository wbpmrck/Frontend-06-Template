# 题目：编写支持括号的BNF产生式

## 考虑下面几种不同的括号形式

``` javascript


(1)+2

(1+2)*3
(1+2)/3
(1/2)+3
(1/2)-3

(1*2)*3
(1*2)/3
(1/2)+3
(1/2)-3

(1+3*5)-1
(1+2)+3

```

可以看到如果把括号表达式看成一个单独的expression,那:
- 乘法表达式需要对其进行支持
- 单独的括号表达式可以看成是乘法表达式的特殊形式
- 加法表达式不需要进行改动

而括号表达式可以是任意的表达式:

- 数字
- 加法表达式
- 乘法表达式

所以括号表达式可以用Expression来定义

## 解：

``` xml

<Expression>::=
  <AddiveExpression>

<AddiveExpression>::=
  <MultiplicativeExpression>|
  <AddiveExpression>"+"<MultiplicativeExpression>|
  <AddiveExpression>"-"<MultiplicativeExpression>

<MultiplicativeExpression>::=
  <BracketExpression>|
  <MultiplicativeExpression>"*"<BracketExpression>|
  <MultiplicativeExpression>"/"<BracketExpression>

<BracketExpression>::=
  "("<Expression>")"|<Number>

```
