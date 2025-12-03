    // server.js
    import express from 'express';
    import { ApolloServer } from '@apollo/server';
    import { expressMiddleware } from '@as-integrations/express5';
    import { typeDefs, resolvers } from './graphql/schema.js';

    async function startApolloServer() {
      const app = express();
      const server = new ApolloServer({
        typeDefs,
        resolvers,
      });

      await server.start();

      app.use(
        '/graphql',
        express.json(),
        expressMiddleware(server)
      );

      const PORT = 4000;
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}/graphql`);
      });
    }

    startApolloServer();