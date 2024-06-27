import React, { useState, useEffect } from 'react';
import DistributorHeader from './DistributorHeader';
import FarmerHeader from './FarmerHeader';
import FactoryHeader from './FactoryHeader';
import Header from './Header';
import rwandan_tea from '../../services/rwandan_tea';
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as rwandan_tea_backend_idl, canisterId as rwandan_tea_backend_id } from '../../../declarations/rwandan_tea_backend';


const Dashboard = ({ stakeholder }) => {
  if (!stakeholder) {
    return <div>Loading...</div>;
  }

  const role = Object.keys(stakeholder.role)[0];
  const teaBatches = stakeholder.teaBatches || [];

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [principal, setPrincipal] = useState(null);

  const authClientPromise = AuthClient.create();

  const signIn = async () => {
    const authClient = await authClientPromise;
    const internetIdentityUrl = process.env.NODE_ENV === 'production'
      ? undefined
      : `http://localhost:4943/?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`;

    await new Promise((resolve) => {
      authClient.login({
        identityProvider: internetIdentityUrl,
        onSuccess: () => resolve(undefined),
      });
    });

    const identity = authClient.getIdentity();
    updateIdentity(identity);
    setIsLoggedIn(true);
  };

  const signOut = async () => {
    const authClient = await authClientPromise;
    await authClient.logout();
    updateIdentity(null);
    setIsLoggedIn(false);
  };

  const updateIdentity = (identity) => {
    if (identity) {
      setPrincipal(identity.getPrincipal());
      const agent = new HttpAgent({ identity });
      if (process.env.NODE_ENV !== 'production') {
        agent.fetchRootKey().catch(err => {
          console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
          console.error(err);
        });
      }
      const actor = Actor.createActor(rwandan_tea_backend_idl, { agent, canisterId: rwandan_tea_backend_id });
      rwandan_tea.setActor(actor);
    } else {
      setPrincipal(null);
      rwandan_tea.setActor(null);
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      const authClient = await authClientPromise;
      const isAuthenticated = await authClient.isAuthenticated();
      setIsLoggedIn(isAuthenticated);
      if (isAuthenticated) {
        const identity = authClient.getIdentity();
        updateIdentity(identity);
      }
    };

    checkLoginStatus();
  }, [authClientPromise]);


  return (
    <div>
      {role === 'Distributor' && (
        <>
          <DistributorHeader isLoggedIn={isLoggedIn} signIn={signIn} signOut={signOut} />
            <main>
              {isLoggedIn ? (
                <>
                  <div className="container mt-4">
                    <div className="admin-login-container">
                        <h1>Welcome, {stakeholder.name}</h1><br/><br/>
                        <p>This is Distributor's Dashboard</p>
                    </div>
                  </div>
                </>
              ) : (
                  <div className="text-center">
                    <button className="btn btn-primary" onClick={signIn}>Sign In</button>
                  </div>
              )}
            </main>
        </>
      )}
      {role === 'Farmer' && (
        <>
        <FarmerHeader isLoggedIn={isLoggedIn} signIn={signIn} signOut={signOut} />
          <main>
            {isLoggedIn ? (
              <>
                <div className="container mt-4">
                  <div className="admin-login-container">
                      <h1>Welcome, {stakeholder.name}</h1><br/><br/>
                      <p>This is Farmer's Dashboard</p>
                  </div>
                </div>
              </>
            ) : (
                <div className="text-center">
                  <button className="btn btn-primary" onClick={signIn}>Sign In</button>
                </div>
            )}
          </main>
      </>
      )}
      {role === 'Factory' && (
        <>
        <FactoryHeader isLoggedIn={isLoggedIn} signIn={signIn} signOut={signOut} />
          <main>
            {isLoggedIn ? (
              <>
                <div className="container mt-4">
                  <div className="admin-login-container">
                      <h1>Welcome, {stakeholder.name}</h1><br/><br/>
                      <p>This is Factory's Dashboard</p>
                  </div>
                </div>
              </>
            ) : (
                <div className="text-center">
                  <button className="btn btn-primary" onClick={signIn}>Sign In</button>
                </div>
            )}
          </main>
      </>
      )}
      {role === 'Admin' && (
        <>
        <Header isLoggedIn={isLoggedIn} signIn={signIn} signOut={signOut} />
          <main>
            {isLoggedIn ? (
              <>
                <div className="container mt-4">
                  <div className="admin-login-container">
                      <h1>Welcome, {stakeholder.name}</h1><br/><br/>
                      <p>This is Admin's Dashboard</p>
                  </div>
                </div>
              </>
            ) : (
                <div className="text-center">
                  <button className="btn btn-primary" onClick={signIn}>Sign In</button>
                </div>
            )}
          </main>
      </>
      )}
      {/* Add other role-specific functionalities here */}
    </div>
  );
};

export default Dashboard;
