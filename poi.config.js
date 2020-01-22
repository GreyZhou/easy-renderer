module.exports = {
  entry:'./index.js',
  output: {
    dir: "dist",
    format: "umd",
    moduleName: "easyRenderer",
    sourceMap:true,
    fileNames: {js:'[name].js'},
  },
//   publicFolder:'xxxx',  // 指向一个不存在的文件夹
  chainWebpack(config) {
    config.plugins.delete("html");
  },
//   configureWebpack: {
//     resolve: {
//       alias: Config.alias,
//       extensions:Config.extensions,
//     },
//   }
};
