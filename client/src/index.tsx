import React from 'react';
import ReactDOM from 'react-dom/client';
import '../public/css/style.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App';
import Main from './pages/main/main';
import Error from './pages/error/error';
import Me from './pages/me/me';
import Login from './pages/login/login';
import Signup from './pages/signup/signup';
import User from './pages/user/user';
import Settings from './pages/settings/Settings';
import Search from './pages/search/search';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Main />
      },
      {
        path: 'main',
        element: <Main />
      },
      {
        path: 'me',
        element: <Me />
      },
      {
        path: 'signup',
        element: <Signup />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'settings',
        element: <Settings />
      },
      {
        path: 'user/:id',
        element: <User />
      },
      {
        path: 'search',
        element: <Search />
      },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);