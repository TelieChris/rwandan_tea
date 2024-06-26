import React, { useState, useEffect } from 'react';
import rwandan_tea from '../../services/rwandan_tea';
import LoginHeader from './LoginHeader';
import { useNavigate } from 'react-router-dom';
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Carousel } from 'react-bootstrap';
import { idlFactory as rwandan_tea_backend_idl, canisterId as rwandan_tea_backend_id } from '../../../declarations/rwandan_tea_backend';

import cotragagiImage from '../images/cotragagi.jpeg';
import FERWACOTHESLIDERImage from '../images/FERWACOTHESLIDER.jpg';
import rubayaImage from '../images/rubaya.jpeg';


const Login = ({ setStakeholder }) => {
  const [index, setIndex] = useState(0);
  const images = [
    { src: cotragagiImage, alt: 'Cotragagi' },
    { src: FERWACOTHESLIDERImage, alt: 'FERWACOTHESLIDER' },
    { src: rubayaImage, alt: 'Rubaya' }
  ];

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  const [name, setName] = useState('');
  const [principalId, setPrincipalId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [actor, setActor] = useState(null);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name || !principalId) {
      setError('Please enter both name and principal ID.');
      return;
    }
    
    // Check for default admin credentials
    if (name === 'admin' && principalId === 'admin123') {
      const adminStakeholder = {
        id: 0,
        name: 'admin',
        principalId: 'admin123',
        role: { Admin: null },
      };
      setStakeholder(adminStakeholder);
      navigate('/dashboard');
      return;
    }

    try {
      const stakeholder = await rwandan_tea.login(name, principalId);
      if (stakeholder && stakeholder.length > 0) {
        const principalId = stakeholder[0].principalId;
        const roleObject = stakeholder[0].role;
        const role = Object.keys(roleObject)[0];
        console.log("Principal ID:", principalId);
        console.log("Role:", role);

        setStakeholder(stakeholder[0]);
        navigate('/dashboard');
      } else {
        setError('Login failed: Invalid credentials.');
      }
    } catch (err) {
      setError('Login failed: ' + err.message);
    }
  };

  return (
    <>
      <LoginHeader isLoggedIn={isLoggedIn} signIn={signIn} signOut={signOut} />
      <main>
      <div className="welcome-overlay">
      <div className="container text-center">
        {isLoggedIn ? (
        <>
        <div className="admin-login-container">
          <h2 className="text-center">Login</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Principal ID</label>
              <input
                type="password"
                className="form-control"
                placeholder="Principal ID"
                value={principalId}
                onChange={(e) => setPrincipalId(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </form>
        </div>
        </>
        ) : (
          <>
            <h1 className='welcome'>Welcome to Rwandan Tea <br/> Tracking System</h1>
            <div className="text-center">
              <button className="btn btn-primary" onClick={signIn}>Sign In</button>
            </div>
          </>
        )}
        </div>
        </div>
        <Carousel activeIndex={index} onSelect={handleSelect} interval={3000} pause={false} fade className="carousel-fullscreen">
          {images.map((image, idx) => (
            <Carousel.Item key={idx}>
              <img
                className="d-block w-100"
                src={image.src}
                alt={image.alt}
              />
            </Carousel.Item>
          ))}
        </Carousel>
    </main>
  </>
  );
};

export default Login;
