/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Route } from "@solidjs/router";

import { Home, About, Work, Contact } from './pages';

import './index.css';


const root = document.getElementById("root");

render(
  () => (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/work" component={Work} />
      <Route path="/contact" component={Contact} />
    </Router>
  ),
  root
);