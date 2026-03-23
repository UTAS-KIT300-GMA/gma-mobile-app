const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// add svg transformer
config.transformer.babelTransformerPath =
  require.resolve("react-native-svg-transformer");

// remove svg from assets
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg",
);

// add svg to source files
config.resolver.sourceExts.push("svg");

module.exports = config;
