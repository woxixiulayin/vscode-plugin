const cp = require("child_process");

module.exports =  class MyPlugin {
  constructor (props) {
    // this._props = props;
  }

  apply (compiler) {
    // const that = this;
    compiler.hooks.done.tap('Done', () => {
      const devServer = compiler.options.devServer;

      cp.spawn('open', [`mybricks://app=pc-ms&debug=1&comlib-url=http://${devServer.host}:${devServer.port}/bundle.js`]);
    });
  }
};
