const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const glob = require("glob");


module.exports = {
  entry: glob.sync("./src/**/*.{ts,tsx}").reduce((entries, file) => {
    const name = path.basename(file, path.extname(file)); // Extract filename without extension
    entries[name] = file;
    return entries;
  }, {}),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "public/manifest.json", to: "manifest.json" },
        { from: "public/popup.html", to: "popup.html" },
        { from: "public/style.css", to: "style.css" }
      ],
    }),
  ],
};
