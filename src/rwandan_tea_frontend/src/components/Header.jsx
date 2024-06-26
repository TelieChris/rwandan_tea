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
                  <Link className="nav-link" to="/register_stakeholder">Register Stakeholder</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/stakeholders-adm">View Stakeholder</Link>
                </li>
                <li>
                  <button className="btn btn-outline-danger" onClick={signOut}>Sign Out</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                 <button className="btn btn-outline-primary" onClick={signIn}>Sign In</button>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-outline-primary" to="/">Another Account</Link>
              </li>
             </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;
