import React from 'react';
import { Link } from 'react-router-dom';
import { Header, Container, Divider, Icon } from 'semantic-ui-react';

import NavBar from './NavBar';

import './layout.css';
import CalculatorModal from './CalculatorModal';
import SettingsModal from './SettingsModal';
//import ExtractImageDataModal from './ExtractImageData/ExtractImageData';

import PropTypes from 'prop-types';

class Layout extends React.Component {

	constructor(props, children) {
		super(props);
		
		this.title = 'Title';
		
		this.description = 'Description';
		
		this.toggleSettings = this.toggleSettings.bind(this);
		this.toggleCalculator = this.toggleCalculator.bind(this);
		this.toggleDataExtractDialog = this.toggleDataExtractDialog.bind(this);
		
		this.currentFocusedElement = 'calc';
		this.getChildContext = this.getChildContext.bind(this);

		
	}
	
	


	
	getChildContext() {
		return {
			toggleSettings:		this.toggleSettings,
			toggleCalculator:	this.toggleCalculator,
			toggleDataExtractDialog: this.toggleDataExtractDialog}
	}
	toggleDataExtractDialog(e) {
		let w = document.getElementById("imgDataModal");
		
        if(w.style.display=="none" || w.style.display=='') { w.style.display="block"; }
        else  w.style.display="none";
           
    
	}
	

	toggleCalculator() {
		let w = document.getElementById("cw");
		
        if(w.style.display=="none" || w.style.display=='') {
            w.style.display="block";
			window.setInterval(w.updateAnswer, 1000);
        }
        else w.style.display="none";
	}
	
	toggleSettings = (e) => {
		let w = document.getElementById("sw");
		
        if(w.style.display=="none" || w.style.display=='') { w.style.display="block"; }
        else  w.style.display="none";
           
        
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
	render() {
		return(
			<Container>
				<NavBar />
				<TopSection className="mainHeader">
					<h2>{this.title}</h2>
					<p>{this.description}</p>
				</TopSection>
				
				<Container> {this.props.children} </Container>
					
				
				<CalculatorModal id='cw' className='calcWindow' toggleSettings={this.toggleSettings}/>
				<SettingsModal id='sw' className='settingsWindow' />
				
			</Container>
			
		);
	}
	
}

function TopSection({children}) {


	const childrenWithProps = React.Children.map(children,child => {
		if(React.isValidElement(child)) {
			return React.cloneElement(child,{});

		}
		return child;
	});

	return (<div>{childrenWithProps}</div>);

}

Layout.childContextTypes = {
	toggleSettings: 	PropTypes.func,
	toggleCalculator:	PropTypes.func,
	toggleDataExtractDialog: PropTypes.func
}





// const Layout = (title='Title',description='Description',children=null) => {
// 	console.log("children");
// 	console.log(children);
// 	return(

		
// 		<Container>
// 			<NavBar />
// 			<Container className="mainHeader">
// 				<h2>{title}</h2>
// 				<p >{description}</p>
// 			</Container>
// 			<Container >
// 				{children}
// 			</Container>
// 			<CalculatorModal id='cw' className='calcWindow' />
// 			<SettingsModal id='sw' className='settingsWindow' />
// 		</Container>
// 	);
// }

export default Layout;
