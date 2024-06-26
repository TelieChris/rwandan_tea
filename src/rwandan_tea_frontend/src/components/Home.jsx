import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as rwandan_tea_backend_idl, canisterId as rwandan_tea_backend_id } from '../../../declarations/rwandan_tea_backend';
import Header from './Header';
import cotragagiImage from '../images/cotragagi.jpeg';
import FERWACOTHESLIDERImage from '../images/FERWACOTHESLIDER.jpg';
import rubayaImage from '../images/rubaya.jpeg';

function Home() {
  const [index, setIndex] = useState(0);
  const images = [
    { src: cotragagiImage, alt: 'Cotragagi' },
    { src: FERWACOTHESLIDERImage, alt: 'FERWACOTHESLIDER' },
    { src: rubayaImage, alt: 'Rubaya' }
  ];

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [pri, setPri] = useState(null);
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
      const actor = Actor.createActor(rwandan_tea_backend_idl, { agent, canisterId: rwandan_tea_backend_id });
      rwandan_tea_backend.setActor(actor);
    } else {
      setPrincipal(null);
      rwandan_tea_backend.setActor(null);
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

  // const identitys = window.identity;
  // setPri(identitys.getPrincipal().toString());
  

  return (

    <>
      <Header isLoggedIn={isLoggedIn} signIn={signIn} signOut={signOut} />
      <main>
        <div className="welcome-overlay">
          <div className="container text-center">
            <h1 className='welcome'>Welcome to Rwandan Tea <br/> Tracking System</h1>
            {isLoggedIn ? (
              <div>
                <div>
                  <Link to="/create" className="btn btn-primary mr-2">Create Tea Batch</Link>
                  <Link to="/registration" className="btn btn-secondary">Register</Link>
                </div>
                <div>
                <p>Principal Id: {principal.toText()}</p>
              </div>
            </div>
            ) : (
              <button className="btn btn-primary" onClick={signIn}>Sign In</button>
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
}

export default Home;
