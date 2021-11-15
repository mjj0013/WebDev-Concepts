import React from 'react';
import { Link } from 'react-router-dom';
import { Header, Container, Divider, Icon } from 'semantic-ui-react';

import NavBar from './NavBar';

import './layout.css';
import CalculatorModal from './CalculatorModal';
import SettingsModal from './SettingsModal';



const toggleSettings = function (e) {
	
	
	let w = document.getElementById("sw");
	
	if(w.style.display=="none" || w.style.display=='') {
		
		w.style.display="block";
		//window.setInterval(w.updateAnswer, 1000);
	}
	else w.style.display="none";
	
	

	if(e.target.id=="calcSettingsButton") {		//settings request came from calculator
		console.log("calculator button requested settings")

		//document.getElementById('elementSettingsPage').appendChild(this.calculatorSpecificSettings());
		console.log(document.getElementById('elementSettingsPage'));
		this.currentFocusedElement = "calc";
	}

	if(e.target.id=="homeSettingsButton") {		//settings request came from Home Page
		console.log("home button requested settings")
	}
}


const Layout = ({title="Title", description="Description", children }) => {
  return (
  
	<Container >
		<NavBar />
		<CalculatorModal id="cm" toggleSettings={toggleSettings} tabindex="100" />
		<SettingsModal id='calcSettingsModal' tabindex="101" />
		
		<Container className="mainHeader">
      			<h2>{title}</h2>
      			<p >{description}</p>
      	</Container>

		<Container >
			{children}
		</Container>
		
    </Container>
  );
  
};



export default Layout;
