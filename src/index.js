import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { HashRouter, Route, Routes} from 'react-router-dom';
import Login from './Login';
import { createBrowserHistory } from 'history';
import LoginWrapper from './Login';

const root = ReactDOM.createRoot(document.getElementById('root'));
const history = createBrowserHistory();
root.render(
  <HashRouter history={history}>
  <Routes>
    <Route exact={true} path="/" element={<App />} />
    <Route exact={true} path="/login" element={<LoginWrapper />} />
  </Routes>
</HashRouter>

);

