import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="main-header">
      <div className="logo">Tourist App</div>
      <nav className="nav-links">
        <Link to="TouristApp">Home</Link>
        <Link to="/register">Register ID</Link>
        {/* <Link to="/admin">Admin Portal</Link> */}
        <Link to="/map">Safety Map</Link>
        <Link to="/languages">Change Language</Link>
      </nav>
    </header>
  );
}

export default Header;
