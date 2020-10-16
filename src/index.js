import React from 'react';
import ReactDOM from 'react-dom';
import './stylesheets/index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import 'firebase/functions';
import 'firebase/storage';

var firebaseConfig = {
  apiKey: "AIzaSyDiJ4HIp6I0d-Jb833mRCOWR_HeQWFQM8I",
  authDomain: "center-59cef.firebaseapp.com",
  databaseURL: "https://center-59cef.firebaseio.com",
  projectId: "center-59cef",
  storageBucket: "center-59cef.appspot.com",
  messagingSenderId: "631911394635",
  appId: "1:631911394635:web:beea37fce6c83c30338cce",
  measurementId: "G-NRKZD107KQ"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

/*
var db = firebase.firestore();
var functions = firebase.functions();
if (window.location.hostname === "localhost") {
  functions.useFunctionsEmulator('http://localhost:5001');
  db.settings({
    host: "localhost:8080",
    ssl: false
  });
}
*/

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
