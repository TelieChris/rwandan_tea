# Rwandan Tea Traceability System

The Rwandan Tea Traceability System is a decentralized application (dApp) built on the Internet Computer (IC) platform. It aims to provide traceability for tea batches from farmers to consumers, ensuring transparency and trust in the supply chain.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Contributing](#contributing)

## Introduction

This project provides a comprehensive traceability solution for the Rwandan tea industry. It allows stakeholders to register, create tea batches, assign distributors and retailers, and trace the journey of tea batches through the supply chain.

## Features

- Stakeholder registration (Farmers, Distributors, Retailers, Consumers)
- Creation of tea batches by farmers
- Assignment of distributors and retailers to tea batches
- Traceability of tea batches
- QR code generation for each tea batch

## Technology Stack

- [Internet Computer (IC)](https://internetcomputer.org/)
- [Motoko](https://sdk.dfinity.org/docs/language-guide/motoko.html) (Backend)
- [React](https://reactjs.org/) (Frontend)
- [dfx SDK](https://sdk.dfinity.org/docs/developers-guide/cli-reference.html) (Deployment and local development)

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/)
- [dfx SDK](https://sdk.dfinity.org/docs/developers-guide/install-upgrade-remove.html)

### Steps

1. Clone the repository:
   git clone https://github.com/TelieChris/rwandan_tea.git
   cd rwandan_tea

2. Install dependencies:
  npm install

3. Start dfx and the local Internet Computer replica:
  dfx start --clean --background

4. Deploy and build the backend canister:
  dfx deploy

## Contributing
### We welcome contributions to the project. To contribute, follow these steps:

1. Fork the repository
2. Create a new branch (git checkout -b feature-branch)
3. Make your changes
4. Commit your changes (git commit -m 'Add new feature')
5. Push to the branch (git push origin feature-branch)
6. Create a new Pull Request
