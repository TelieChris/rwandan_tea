import React, { useState, useEffect } from 'react';
import rwandan_tea from '../../services/rwandan_tea';
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import Header from './Header'; // Import Header

function StakeholdersList() {
  const [stakeholders, setStakeholders] = useState([]);
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
    const fetchStakeholders = async () => {
      try {
        const result = await rwandan_tea.getStakeholders();
        setStakeholders(result);
      } catch (error) {
        console.error("Error fetching Stakeholders", error);
      }
    };
    fetchStakeholders();
  }, []);

  const deleteStakeholder = async (id) => {
    try {
      await rwandan_tea.deleteStakeholder(id);
      setStakeholders(stakeholders.filter(stake => stake.id !== id));
      alert("Stakeholder deleted successfully!");
    } catch (error) {
      console.error('Error deleting stakeholder:', error);
      alert(`Error deleting stakeholder: ${error.message}`);
    }
  };

  const updateStakeholder = async (id, updatedName, updatedRole) => {
    try {
      const variantRole = { [updatedRole]: null };
      await rwandan_tea.updateStakeholder(id, variantRole, updatedName);
      const updatedStakeholders = stakeholders.map(stake => {
        if (stake.id === id) {
          return { ...stake, name: updatedName, role: variantRole };
        }
        return stake;
      });
      setStakeholders(updatedStakeholders);
      alert("Stakeholder updated successfully!");
    } catch (error) {
      console.error('Error updating stakeholder:', error);
      alert(`Error updating stakeholder: ${error.message}`);
    }
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} signIn={signIn} signOut={signOut} />
      <main className="container mt-4">
        {isLoggedIn ? (
          <>
            <div className="container mt-4">
              <h2>Stakeholders list</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stakeholders.map((stake, index) => (
                    <tr key={index}>
                      <td>{String(stake.id)}</td>
                      <td>{stake.name}</td>
                      <td>{Object.keys(stake.role)[0]}</td>
                      <td>
                        <button className="btn btn-primary btn-sm mr-2" onClick={() => deleteStakeholder(stake.id)}>Delete</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => {
                          const updatedName = prompt("Enter updated name:", stake.name);
                          const updatedRole = prompt("Enter updated role:", Object.keys(stake.role)[0]);
                          if (updatedName && updatedRole) {
                            updateStakeholder(stake.id, updatedName, updatedRole);
                          }
                        }}>Update</button>
                      </td>
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

export default StakeholdersList;
