import React, { useState, useEffect } from 'react';
import rwandan_tea from '../../services/rwandan_tea';
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import Header from './Header';
import FarmerHeader from './FarmerHeader';

function TeaBatchList() {
  const [batches, setBatches] = useState([]);
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


  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const result = await rwandan_tea.getTeaBatches();
        setBatches(result);
      } catch (error) {
        console.error("Error fetching tea batches:", error);
      }
    };
    fetchBatches();
  }, []);

  return (
    <>
      <FarmerHeader isLoggedIn={isLoggedIn} signIn={() => {}} signOut={() => {}} />
      <main className="container mt-4">
      {isLoggedIn ? (
        <>
          <div className="container mt-4">
            <h2>Tea Batches</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Farmer</th>
                  <th>Quantity (kg)</th>
                  <th>Status</th>
                  <th>Distributor</th>
                  <th>Retailer</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch, index) => (
                  <tr key={index}>
                    <td>{batch.farmer}</td>
                    <td>{String(batch.quantity)} kg</td>
                    <td>{batch.status}</td>
                    <td>{batch.distributor}</td>
                    <td>{batch.retailer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </>
    ) : (
      <div className="text-center">
        <button className="btn btn-primary" onClick={signIn}>Sign In</button>
      </div>
    )}
  </main>
  </>
  );

}

export default TeaBatchList;
