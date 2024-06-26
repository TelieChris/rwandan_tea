import { Ed25519KeyIdentity } from "@dfinity/identity";
import { canisterId, createActor } from "../../../declarations/rwandan_tea_backend";

export function seedToIdentity(seed) {
  const seedBuf = new Uint8Array(new ArrayBuffer(32));
  if (seed.length && seed.length > 0 && seed.length <= 32) {
    seedBuf.set(new TextEncoder().encode(seed));
    return Ed25519KeyIdentity.generate(seedBuf);
  }
  return null;
}

export function getActor(identity) {
  return createActor(canisterId, {
    agentOptions: {
      identity,
    },
  });
}
