import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './components/Home';
import CreateTeaBatch from './components/CreateTeaBatch';
import AssignDistributor from './components/AssignDistributor';
import TeaBatchList from './components/TeaBatchList';
import RegisterStakeholder from './components/RegisterStakeholder';
import StakeholdersList from './components/StakeholdersList';
import AssignRetailer from './components/AssignRetailer';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateTeaBatch />} />
        <Route path="/assign-distributor" element={<AssignDistributor />} />
        <Route path="/list" element={<TeaBatchList />} />
        <Route path='/register_stakeholder' element={<RegisterStakeholder />} />
        <Route path='/stakeholders' element={<StakeholdersList />} />
        <Route path="/assign-retailer" component={<AssignRetailer />} />
      </Routes>
    </Router>
  );
};

export default App;
