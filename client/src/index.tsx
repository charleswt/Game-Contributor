import React from 'react';
import ReactDOM from 'react-dom/client';
import '../public/css/style.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App';
import Main from './pages/main/main';
import Error from './pages/error/error';

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
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);