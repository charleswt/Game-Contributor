import { Outlet } from 'react-router-dom';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import CookieAuth from './utils/auth'

import Navbar from './components/navbar/navbar';
import Footer from './components/footer/footer';

const link = createHttpLink({
  uri: '/graphql',
});

const authentication = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});


const client = new ApolloClient({
  link: authentication.concat(link),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
        <Navbar />
        <Outlet />
        <Footer />
    </ApolloProvider>
  );
}

export default App;