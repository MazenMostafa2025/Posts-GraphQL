const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4'); // Express 5 compatible
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { loadFilesSync } = require('@graphql-tools/load-files');
const { mergeTypeDefs } = require('@graphql-tools/merge');

const path = require('path');

const typeDefsArray = loadFilesSync(path.join(__dirname, 'graphql/**/*.graphql'));
const typeDefs = mergeTypeDefs(typeDefsArray);


const postResolvers = require('./graphql/resolvers/postResolver');
const userResolvers = require('./graphql/resolvers/userResolver');

const resolvers = [
  userResolvers,
  postResolvers
];


const buildContext = require('./context');
// Create the executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const router = express.Router();
const app = express();
app.use(express.json());

const server = new ApolloServer({ schema });

async function startServer() {
  
  // Apply Apollo middleware
  await server.start();
  app.use('/graphql', expressMiddleware(server, {
    context: buildContext
  }));

  const PORT = 4000;
  app.listen(PORT, () =>
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`)
  );
}

startServer();
