import { AnonymousIdentity } from "@dfinity/agent";
import { backend as default_backend_actor } from "../../../declarations/rwandan_tea_backend";
import { getActor, prepareLoginBotton, seedToIdentity } from "./identity";

const main = async () => {
  setupListeners();
  poll();
};

document.addEventListener("DOMContentLoaded", main);

const render = () => {
  const identity = window.identity;
  const output = document.querySelector("#output");
  if (!output) throw new Error("Output element not found");
  if (identity) {
    output.innerHTML = identity.getPrincipal().toString();
    document.querySelector("#increment")?.removeAttribute("disabled");
    getCount();
    renderTable();
  } else {
    output.innerHTML = "";
  }
};

const setupListeners = () => {
  document.querySelector("#secret")?.addEventListener("input", handleChange);
};

const handleChange = async (event) => {
  const { value } = event.target;
  try {
    const identity = seedToIdentity(value);
    const output = document.querySelector("#principal");
    if (!output) throw new Error("Output element not found");
    if (identity) {
      window.identity = identity;
    }
  } catch (error) {
    console.error(error);
  }
  render();
};

document.querySelector("#form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  return false;
});

const getCount = async () => {
  const identity = window.identity || new AnonymousIdentity();
  const actor = getActor(identity);
  const count = await actor.myCount();
  document.querySelector("#count").innerHTML = count;
  return count;
};

function poll() {
  setInterval(() => {
    getCount();
    renderTable();
  }, 5000);
}
