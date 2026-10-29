import React, { createContext, useContext, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { t, getLang } from './i18n';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Crud from './pages/Crud';
import Weather from './pages/Weather';
import Shop from './pages/Shop';
import Community from './pages/Community';
import Admin from './pages/Admin';

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

const Guard = ({ children, admin }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [, force] = useState(0);
  const nav = useNavigate();
  const login = (token, u) => { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(u)); setUser(u); nav('/'); };
  const logout = () => { localStorage.clear(); setUser(null); nav('/login'); };
  const setLang = l => { localStorage.setItem('lang', l); force(x => x + 1); };

  const farmFields = [
    { name: 'name', label: 'Farm name', required: true }, { name: 'location', label: 'Location', required: true },
    { name: 'areaAcres', label: 'Area (acres)', type: 'number' }, { name: 'soilType', label: 'Soil type' }
  ];
  const cropFields = [
    { name: 'farm', label: 'Farm', type: 'select', from: 'farms', required: true }, { name: 'name', label: 'Crop', required: true },
    { name: 'sowingDate', label: 'Sowing date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: ['growing', 'harvested', 'failed'] },
    { name: 'ph', label: 'Soil pH', type: 'number' }, { name: 'nitrogen', label: 'Nitrogen (kg/ha)', type: 'number' },
    { name: 'phosphorus', label: 'Phosphorus (kg/ha)', type: 'number' }, { name: 'potassium', label: 'Potassium (kg/ha)', type: 'number' }
  ];

  return (
    <Ctx.Provider value={{ user, login, logout }}>
      {user && (
        <nav className="topbar navbar navbar-expand-lg navbar-dark">
          <div className="container">
            <span className="brand navbar-brand">AgriTech</span>
            <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#nv" aria-label="Menu"><span className="navbar-toggler-icon" /></button>
            <div className="collapse navbar-collapse" id="nv">
              <div className="navbar-nav me-auto">
                {[['/', 'dashboard'], ['/farms', 'farms'], ['/crops', 'crops'], ['/weather', 'weather'], ['/shop', 'shop'], ['/community', 'community']].map(([to, k]) =>
                  <NavLink key={to} to={to} end={to === '/'} className="nav-link">{t(k)}</NavLink>)}
                {user.role === 'admin' && <NavLink to="/admin" className="nav-link">{t('admin')}</NavLink>}
              </div>
              <select aria-label="Language" className="form-select form-select-sm w-auto me-2" value={getLang()} onChange={e => setLang(e.target.value)}>
                <option value="en">English</option><option value="hi">हिन्दी</option>
              </select>
              <button className="btn btn-sm btn-outline-light" onClick={logout}>{t('logout')}</button>
            </div>
          </div>
        </nav>
      )}
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/" element={<Guard><Dashboard /></Guard>} />
        <Route path="/farms" element={<Guard><Crud title={t('farms')} endpoint="farms" fields={farmFields} columns={['name', 'location', 'areaAcres', 'soilType']} /></Guard>} />
        <Route path="/crops" element={<Guard><Crud title={t('crops')} endpoint="crops" fields={cropFields} columns={['name', 'farm.name', 'status', 'ph', 'soilReport']} /></Guard>} />
        <Route path="/weather" element={<Guard><Weather /></Guard>} />
        <Route path="/shop" element={<Guard><Shop /></Guard>} />
        <Route path="/community" element={<Guard><Community /></Guard>} />
        <Route path="/admin" element={<Guard admin><Admin /></Guard>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Ctx.Provider>
  );
}
