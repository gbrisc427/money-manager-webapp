import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Recover from './pages/Recover';
import LandingPage from './pages/LandingPage';
import Categories from './pages/Categories';   
import Transactions from './pages/Transactions'; 
import Accounts from './pages/Accounts';
import AccountDetail from './pages/AccountDetail';
import ExportData from "./pages/ExportData"; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/recover" element={<Recover />} />
      
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/categories" element={<Categories />} />     
      <Route path="/transactions" element={<Transactions />} /> 
      <Route path="/accounts" element={<Accounts/>} />
      <Route path="/accounts/:id" element={<AccountDetail />} />
      <Route path="/export" element={<ExportData />} /> 
    </Routes>
  );
}

export default App;