import React from 'react';
import { Link } from 'react-router-dom';

function Header({ isLoggedIn, signOut, signIn }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">Rwandan Tea</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ml-auto">
            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/create">Create Tea Batch</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/list">View Tea Batches</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register_stakeholder">Register Stakeholder</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/stakeholders">View Stakeholder</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/assign-distributor">Assign Distributor</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/assign-retailer">Assign Retailer</Link>
                </li>
                <li>
                  <button className="btn btn-outline-danger" onClick={signOut}>Sign Out</button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <button className="btn btn-outline-primary" onClick={signIn}>Sign In</button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;
