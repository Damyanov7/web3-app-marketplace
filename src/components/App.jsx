import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { WagmiConfig, configureChains, createClient } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

import Mint from "../pages/Mint";
import Collection from "../pages/Collection";
import Profile from "../pages/Profile";
import Home from "../pages/Home";
import NftPage from "../pages/NftPage"

import Header from './layout/Header';
import Footer from './layout/Footer';

function App() {
  const { provider } = configureChains([sepolia], [publicProvider()]);

  const client = createClient({
    provider,
    autoConnect: true,
  });

  return (
    <BrowserRouter>
      <WagmiConfig client={client}>
        <div className="wrapper">
          <Header />
          <div className="main">
            <Routes>
              <Route path='/'           element={<Home />}        />
              <Route path='/NftPage'    element={<NftPage />}     />
              <Route path='/mint'       element={<Mint />}        />
              <Route path='/collection' element={<Collection />}  />
              <Route path='/profile'    element={<Profile />}     /> 
            </Routes>
          </div>
          <Footer />
        </div>
      </WagmiConfig>
    </BrowserRouter>
  );
}

export default App;
