import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { hostname } from 'os';

ReactDOM.render(<App />, document.getElementById('root'));

// By default, create-react-app will cause the browser to refresh the page whenever its source code is modified
// The most useful benefit of HMR is that you can keep the application state after the application reloads. 
// For instance, assume you have a dialog or wizard in your application with multiple steps, and you are on step 3. 
// Without HMR, you make changes to the source code and your browser refreshes the page. 
// You would then have to open the dialog again and navigate from step 1 to step 3 each time. 
// With HMR your dialog stays open at step 3, so you can debug from the exact point you’re working on. 
// With the time saved from page loads, this makes HMR an invaluable tool for React developers.

// activate Hot Module Replacement (HMR) - a tool for reloading your application in the browser without the page refresh
if (module.hot) {
    module.hot.accept();
}