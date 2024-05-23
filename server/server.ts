import express, { Request, Response, NextFunction } from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import cookiesMiddleware from 'universal-cookie-express';
import { authMiddleware } from './utils/auth';
import { ApolloServer } from '@apollo/server';
import {typeDefs, resolvers} from './schemas'
import db from './config/connect';
import path from 'path';
// import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 4000;

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(cookiesMiddleware()).use((req: Request, res: Response, next: NextFunction) => {
    req.token = req.universalCookies.get('token_auth');
    next();
  });

  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });

  app.use('/graphql', expressMiddleware(server, { context: authMiddleware }));

  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });

  db.once('open', () => {
    console.log('Connected to PostgreSQL');
  });
};

startApolloServer();