import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";
import KMap from './page/KarnaughMapApp';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<KMap />}/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);


