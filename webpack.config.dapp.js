const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack =require("webpack");
module.exports = {
  entry: ['babel-polyfill', path.join(__dirname, "src/dapp")],
  output: {
    path: path.join(__dirname, "prod/dapp"),
    filename: "bundle.js",
    sourceMapFilename: "bundle.js.map"
  },
  module: {
    rules: [
    {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      },
      {
        test: /\.html$/,
        use: "html-loader",
        exclude: /node_modules/
      }
    ]
  },
  devtool: "source-map",
  plugins: [
    new HtmlWebpackPlugin({ 
      template: path.join(__dirname, "src/dapp/index.html")
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_DEBUG": JSON.stringify(process.env.NODE_DEBUG)
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    })
  ],
    

  resolve: {
    extensions: [".js"],
    fallback: {
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "os": false,
      "assert": false,
      "crypto": require.resolve("crypto-browserify"),
      "stream": false,  

    }
  },
  devServer: {
    static: path.join(__dirname, "dapp"),
    port: 8000,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
    //stats: "minimal"
  }
};
