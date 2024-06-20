import React, { useState, useEffect } from 'react';
import rwandan_tea from '../../services/rwandan_tea';
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as rwandan_tea_backend_idl, canisterId as rwandan_tea_backend_id } from '../../../declarations/rwandan_tea_backend';
import Header from './Header';

function CreateTeaBatch() {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [status, setStatus] = useState('');
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

  const createBatch = async () => {
    try {
      console.log('Creating batch with name:', name, 'and quantity:', quantity);
      await rwandan_tea.createTeaBatch(name, quantity);
      setStatus('Batch created successfully!');
    } catch (error) {
      console.error('Error creating batch:', error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} signIn={signIn} signOut={signOut} />
      <main className="container mt-4">
        {isLoggedIn ? (
          <>
            <p>Welcome back, {principal ? principal.toString() : "User"}!</p>
            <div className="card p-4">
              <h2 className="card-title">Create Tea Batch</h2>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Quantity" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Number(e.target.value))} 
                />
              </div>
              <button className="btn btn-primary" onClick={createBatch}>Create</button>
              <p className="mt-3">{status}</p>
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

export default CreateTeaBatch;
