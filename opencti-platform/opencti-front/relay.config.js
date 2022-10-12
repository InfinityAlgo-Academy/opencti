// relay.config.js
module.exports = {
  src: './src',
  schema: './src/schema/relay.schema.graphql',
  language: "typescript",
  excludes: ['/node_modules/', '/__mocks__/', '/__generated__/'],
};
