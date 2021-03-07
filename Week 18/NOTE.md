# 学习笔记

> 这里会记录一些上课的心得感想

## 心得

### 使用babel/register来解决node module无法使用import的问题

因为`mocha`是基于node.js跑测试用例的，所以遇到我们日常使用import/export编写的模块的时候，会出现模块无法引入的情况，这时候可以使用babel/register来解决

> 注意，使用babel一定要同时安装babel/core 和babel/preset-env,然后通过添加`.babelrc`文件来定义插件的使用
### 使用nyc来进行代码覆盖度检查

- 注意，结合Nyc和babel一起用的话，需要给他们倆互相加插件：
  - babel-plugin-istanbul加入到babel插件
  - nyc-config-babel 加入到 .nycrc

### 使用vscode配置来启用调试

- runtimeArgs:传递给node.js的命令行参数
- args:传递给
- 配置sourceMap来激活断点：因为经过babel的转码所以需要启用sourceMap来使得断点正确

## 作业(**必做**)
### 01-完成课上练习，提交至Github

- test-demo
  - 使用 `npm run test` 来运行测试脚本
`已完成`