import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import Layout from 'components/Layout';
import Register from 'pages/Register';
import Verify from 'pages/Verify';
import Unregister from 'pages/Unregister';

function App() {
  return (
    <Layout>
      <Router>
        <Switch>
          <Route path='/unregister' exact component={Unregister} />
          <Route path='/verify' exact component={Verify} />
          <Route path='/' exact component={Register} />
        </Switch>
      </Router>
    </Layout>
  );
}

export default App;
