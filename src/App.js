import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import TaskAssigned from './components/TaskAssigned';
import ProjectDetails from './components/ProjectDetails.jsx';
import Contact from './pages/Contact.jsx';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route path="/projects/:id" component={ProjectDetails} /> // Ensure the parameter name is 'id'
        <Route path="/task-assigned" component={TaskAssigned} />
        <App />
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);