import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals'; 

// 🆕 Bootstrap CSS ko import kiya (Ye line poore project me responsiveness laati hai)
import 'bootstrap/dist/css/bootstrap.min.css';

// React app ko 'root' naam ke HTML element ke andar render (load) kar rahe hain
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance check karne ke liye (Ye default hota hai, isme change nahi karna)
reportWebVitals();