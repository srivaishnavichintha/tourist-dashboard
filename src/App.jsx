import { Routes, Route } from 'react-router-dom';
import TouristApp from './TouristApp';
import Register from './Register';
import Header from './Header';
import Safetymap from './Safetymap'

function App() {
  return (
    <>
      <Header /> {/* This stays across all pages */}
      <Routes>
        <Route path="/TouristApp" element={<TouristApp />} />
        <Route path="/register" element={<Register />} />
         <Route path="/map" element={<Safetymap />} />
      </Routes>
    </>
  );
}

export default App;
