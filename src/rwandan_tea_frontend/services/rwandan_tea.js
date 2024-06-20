import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as rwandan_tea_backend_idl, canisterId as rwandan_tea_backend_id } from '../../declarations/rwandan_tea_backend';

// Ensure the agent uses the correct identity and network configuration
const agent = new HttpAgent({ host: 'http://127.0.0.1:4943' });

// Optionally, fetch the root key when in local development
if (process.env.NODE_ENV !== 'production') {
  agent.fetchRootKey();
}

let rwandan_tea = Actor.createActor(rwandan_tea_backend_idl, { agent, canisterId: rwandan_tea_backend_id });

const setActor = (newActor) => {
  rwandan_tea = newActor;
};



const getActor = () => rwandan_tea;

export default rwandan_tea;
export { setActor, getActor };
