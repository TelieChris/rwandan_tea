import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';  // Importing Modal and Button from react-bootstrap
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as rwandan_tea_backend_idl, canisterId as rwandan_tea_backend_id } from '../../../declarations/rwandan_tea_backend';
import rwandan_tea, { setActor } from '../../services/rwandan_tea';
import Header from './Header';

const roles = [
  { value: "", label: "Select Role" },
  { value: "Farmer", label: "Farmer" },
  { value: "Distributor", label: "Distributor" },
  { value: "Retailer", label: "Retailer" },
  { value: "Consumer", label: "Consumer" }
];

function CreateStakeholders() {
  const [name, setName] = useState('');
  const [role, setRole] = useState(roles[0].value);
  const [status, setStatus] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [showModal, setShowModal] = useState(false);  // State for controlling modal visibility

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

    checkLoginStatus();
  }, [authClientPromise]);

  const registerStakeholder = async () => {
    try {
      const variantRole = { [role]: null };
      await rwandan_tea.registerStakeholder(variantRole, name);
      setStatus('Stakeholder registered successfully!');
      setShowModal(true);  // Show modal on successful registration
    } catch (error) {
      console.error('Error registering stakeholder:', error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} signIn={signIn} signOut={signOut} />
      <div className="container mt-4">
        {isLoggedIn ? (
          <>
            <h2>Register Stakeholder</h2>
            <div className="card p-4">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  className="form-control"
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary mt-3" onClick={registerStakeholder}>
                Register
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

      {/* Modal for successful registration */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Registration Successful</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Stakeholder registered successfully!
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CreateStakeholders;
