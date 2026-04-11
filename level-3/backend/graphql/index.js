const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const jwt = require('jsonwebtoken');

const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/use/ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Create Apollo Server
const createApolloServer = async (httpServer) => {
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Create WebSocket server mapped to /graphql
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  // Attach graphql-ws to the WebSocketServer
  const serverCleanup = useServer({
    schema,
    context: async (ctx, msg, args) => {
      // Extract auth token from connectionParams for WebSockets
      const token = ctx.connectionParams?.authorization || '';
      return createContext({ req: { headers: { authorization: token } } });
    }
  }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
    introspection: process.env.NODE_ENV !== 'production',
  });

  await server.start();
  return server;
};

// Context creation for authentication
const createContext = async ({ req }) => {
  const token = req.headers.authorization || '';
  
  if (token && token.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(token.substring(7), JWT_SECRET);
      return { user: decoded };
    } catch (error) {
      console.error('Invalid token:', error.message);
    }
  }
  
  return { user: null };
};

module.exports = { createApolloServer, createContext };
