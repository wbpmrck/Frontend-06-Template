# 课后作业：7. CSS选择器 | 选择器的优先级

## 题目：请写出下面选择器的优先级

```css
div#a.b .c[id=x]

#a:not(#b)

*.a

div.a

```

## 解

| selector         | inline | id  | class selectors, attributes selectors, and pseudo-classes | type selectors and pseudo-elements |
| ---------------- | ------ | --- | --------------------------------------------------------- | ---------------------------------- |
| div#a.b .c[id=x] | 0      | 1   | 3                                                         | 1                                  |
| #a:not(#b)       | 0      | 2   | 0                                                         | 0                                  |
| *.a              | 0      | 0   | 1                                                         | 0                                  |
| div.a            | 0      | 0   | 1                                                         | 1                                  |