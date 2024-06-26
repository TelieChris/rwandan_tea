import React, { useState, useEffect } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as rwandan_tea_backend_idl, canisterId as rwandan_tea_backend_id } from '../../../declarations/rwandan_tea_backend';
import rwandan_tea, { setActor } from '../../services/rwandan_tea';
import Header from './Header';
import FarmerHeader from './FarmerHeader';

const roles = [
    { value: "", label: "Select Role" },
    { value: "Farmer", label: "Farmer" },
    { value: "Distributor", label: "Distributor" },
    { value: "Retailer", label: "Retailer" },
    { value: "Consumer", label: "Consumer" }
  ];

function AssignDistributor() {
  const [batchId, setBatchId] = useState('');
  const [distributor, setDistributor] = useState('');
  const [role, setRole] = useState(roles[0].value);
  const [batches, setBatches] = useState([]);
  const [distributors, setDistributors] = useState([]);
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
      setActor(actor);
    } else {
      setPrincipal(null);
      setActor(null);
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

    setRole("Distributor");
    const fetchDistributors = async () => {
      try {
        const variantRole = { [role]: null };
        const result = await rwandan_tea.getStakeholdersByRole(variantRole);
        setDistributors(result);
      } catch (error) {
        console.error('Error fetching distributors:', error);
      }
    };

    const fetchBatches = async () => {
      try {
        const result = await rwandan_tea.getTeaBatchesId();
        setBatches(result);
      } catch (error) {
        console.error('Error fetching tea batches:', error);
      }
    };

    checkLoginStatus();
    fetchDistributors();
    fetchBatches();
  }, [authClientPromise]);

  const assignDistributor = async () => {
    try {
      const result = await rwandan_tea.assignDistributor(BigInt(batchId), distributor);
      if (result) {
        setStatus('Distributor assigned successfully!');
      } else {
        setStatus('Error assigning distributor.');
      }
    } catch (error) {
      console.error('Error assigning distributor:', error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <FarmerHeader isLoggedIn={isLoggedIn} signIn={signIn} signOut={signOut} />
      <div className="container mt-4">
        {isLoggedIn ? (
          <>
            <h2>Assign Distributor</h2>
            <div className="card p-4">
              <div className="form-group">
                <label htmlFor="batchId">Batch ID</label>
                <select
                  className="form-control"
                  id="batchId"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                >
                  <option value="">Select Batch</option>
                  {batches.map((batch) => (
                    <option key={String(batch.id)} value={String(batch.id)}>
                      {String(batch.id)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="distributor">Distributor</label>
                <select
                  className="form-control"
                  id="distributor"
                  value={distributor}
                  onChange={(e) => setDistributor(e.target.value)}
                >
                  <option value="">Select Distributor</option>
                  {distributors.map((dist) => (
                    <option key={dist.name} value={dist.name}>
                      {dist.name}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary mt-3" onClick={assignDistributor}>
                Assign Distributor
              </button>
              {status && <p className="mt-3 text-info">{status}</p>}
            </div>
          </>
        ) : (
          <div className="text-center">
            <button className="btn btn-primary" onClick={signIn}>Sign In</button>
          </div>
        )}
      </div>
    </>
  );
}

export default AssignDistributor;
