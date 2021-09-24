import React from 'react';
import { Link } from 'react-router-dom';
import { Header, Container, Divider, Icon } from 'semantic-ui-react';


import './layout.css';


const NavBar = () => {
  return (	
	<div class="nav-menu">
		<Container>
			<Link to="/" className="nav-link">Home</Link>
			<Link to="/fileload" className="nav-link">File Load</Link>
			<Link to="/animation" className="nav-link">Animation</Link>
			<Link to="/game" className="nav-link">Game</Link>
		</Container>
	</div>

	
    	
  );
  
};

export default NavBar;
