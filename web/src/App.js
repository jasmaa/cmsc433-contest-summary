import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Layout from 'components/Layout';
import Home from 'pages/Home';
import Verify from 'pages/Verify';
import Unregister from 'pages/Unregister';

function App() {
  return (
    <Layout>
      <Router>
        <Switch>
          <Route path='/unregister' exact component={Unregister} />
          <Route path='/verify' exact component={Verify} />
          <Route path='/' exact component={Home} />
        </Switch>
      </Router>
    </Layout>
  );
}

export default App;
