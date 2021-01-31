let path = require('path');
module.exports = {
  entry:"./main.js",
  // output:{
  //   filename: '[name].js',
  //   path:path.resolve(__dirname, 'dist')
  // },
  devServer:{
    port:8290,
    hot:true,
  },
  module:{
    rules:[
      {
        test:/\.js$/,
        use:{
          loader:"babel-loader",
          options:{
            presets:["@babel/preset-env"],
            plugins:[
              ["@babel/plugin-transform-react-jsx",{pragma:"createElement"}]
            ]
          }
        }
      }
    ]
  },
  mode:"development"
}