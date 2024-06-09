module.exports = {
    // ...
    resolve: {
      fallback: {
        "path": require.resolve("path-browserify"),
        "util": require.resolve("util/"),
        "fs": false,
      }
    }
  };