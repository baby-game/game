import { Web3ReactProvider } from '@web3-react/core';
import Web3NetworkProvider from './components/web3/Web3NetworkProvider';
import Web3ReactManager from './components/web3/Web3RectManager';
import { HashRouter, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import getLibrary from './utils/getLibrary';
import Home from './pages/home';
import HeadBar from './components/headbar';
import Ipo from './pages/ipo';
import Wealth from './pages/wealth/wealth';
import Plan from './pages/plan/plan';
import Community from './pages/ community/ community';


function App() {
  return (
    <div className="App ">
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3ReactManager>
          <Web3NetworkProvider>
            <HashRouter>
              <HeadBar />
              <Routes >
                <Route path="/" element={<Home />} />
                <Route path="/home/:shareAddress?" element={<Home />} />
                <Route path="/ipo" element={<Ipo />} />
                <Route path="/wealth" element={<Wealth />} />
                <Route path="/plan" element={<Plan />} />
                <Route path="/community" element={<Community />} />
              </Routes>
            </HashRouter>
          </Web3NetworkProvider>
        </Web3ReactManager>
      </Web3ReactProvider>
    </div>
  );
}

export default App;
