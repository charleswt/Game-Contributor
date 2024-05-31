import express, { Request, Response, NextFunction } from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import cookiesMiddleware from 'universal-cookie-express';
import { authMiddleware } from './utils/auth';
import { ApolloServer } from '@apollo/server';
import { typeDefs, resolvers } from './gql';
import db from './config/connect';
import path from 'path';
import 'dotenv/config';

declare module 'express' {
  interface Request {
    token?: string;
    universalCookies?: { get: (name: string) => string | undefined };
    user?: { username: string; _id: string };
  }
}

const app = express();
const PORT = process.env.PORT || 4001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(cookiesMiddleware());
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.token = req.universalCookies?.get('token_auth');
    next();
  });

  app.use(authMiddleware);

  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        return { user: req.user };
      },
    })
  );

  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });

  db.once('open', () => {
    console.log('Connected to PostgreSQL');
  });
};

startApolloServer();