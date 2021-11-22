import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Header, Container, Divider, Icon,Button, Dropdown } from 'semantic-ui-react';


import './layout.css';

import Home from './Home'

import PropTypes from 'prop-types';






class NavBar extends React.Component {
	constructor(props) {
		super(props);
		this.toggleSettings = this.toggleSettings.bind(this);
		this.toggleCalculator = this.toggleCalculator.bind(this);
		this.getChildContext = this.getChildContext.bind(this);


		this.selectAnimationCoverSVG = this.selectAnimationCoverSVG.bind(this);
		this.update = this.update.bind(this);

		this.coverTransformMatrix =  [1, 0, 0, 1, 0, 0];
		this.currentZoom = 2;
		this.requestAnimFrame = this.requestAnimFrame.bind(this);
		this.anim = this.anim.bind(this);
		this.intervals = [];
	}
	getChildContext() {
		return {toggleSettings:this.toggleSettings}
	}


	toggleCalculator() {
		let w = document.getElementById("cw");
		if(w == null) return;
        if(w.style.display=="none" || w.style.display=='') {
			
            w.style.display="block";
			window.setInterval(w.updateAnswer, 1000);
        }
        else w.style.display="none";
        
	}

	toggleSettings(e) {
		let w = document.getElementById("sw");
		
        if(w.style.display=="none" || w.style.display=='') { w.style.display="block"; }
        else w.style.display="none";

		if(e.target.id=="calcSettingsButton") {		//settings request came from calculator
			console.log("calculator button requested settings")
			console.log(document.getElementById('elementSettingsPage'));
		}

		//settings request came from Home Page
		if(e.target.id=="homeSettingsButton") {	console.log("home button requested settings"); }
	}

	componentDidMount() {
		this.selectAnimationCoverSVG();

		
		// var zoom1 = ()=>{
		// 	var interval = setInterval(
		// 		() => {
		// 			this.update(-.003);
		// 		}
        // 	, 1000/60);
		// 	this.intervals.push(interval);
		// }
		
		
		
		this.anim();

		//(this.update(-.003))();

        // setTimeout(zoom1,3000);
		// setTimeout(()=> {clearInterval(this.intervals[0])}, 5000)
		
	}

	requestAnimFrame() {
		
			return (callback) => {window.setTimeout(callback, 1000/60)}
	}

	anim() {
		this.requestAnimFrame(this.update(-.003));
			
		let z = Math.pow(.2,-.003)
	
		let zoomCoordinates = {x:300,y:20}
		var coverSVG = document.getElementById("coverSVG");
		
			
		for(var x =0; x < 6; ++x) this.coverTransformMatrix[x] *=(z)
	
		this.coverTransformMatrix[4] += (1-z)*(zoomCoordinates.x);
		this.coverTransformMatrix[5] += (1-z)*(zoomCoordinates.y);
		coverSVG.setAttribute("transform", `matrix(${this.coverTransformMatrix.join(' ')})`);
	};


	update(factor) {
		
		
		let z = Math.pow(.2,factor)

		let zoomCoordinates = {x:300,y:20}
		var coverSVG = document.getElementById("coverSVG");
		
			
		for(var x =0; x < 6; ++x) this.coverTransformMatrix[x] *=(z)

		this.coverTransformMatrix[4] += (1-z)*(zoomCoordinates.x);
		this.coverTransformMatrix[5] += (1-z)*(zoomCoordinates.y);
		coverSVG.setAttribute("transform", `matrix(${this.coverTransformMatrix.join(' ')})`);

	}



	selectAnimationCoverSVG() {
		let hexPerRow = 12;
		let length = 40;
		let pt1 = {x:5,y:25};
		let xOrigin = pt1.x;
		

		let side = {x:length*Math.cos(60*Math.PI/180), y:length*Math.sin(60*Math.PI/180)}

		
		var triangleGroup = document.getElementById("triangleGroup");
		
		triangleGroup.insertAdjacentHTML('beforeend',`<set attributeName="fill" begin="2s" to="freeze" repeatCount="indefinite" dur="10s" />`)
		triangleGroup.insertAdjacentHTML('beforeend',`<animateTransform id="op" begin="3s;op.end+3s" attributeName="transform" attributeType="XML" type="skewX" values="0 ; -50; -50;0; 0" keyTimes="0;.25;.5;.75;1" dur="15s"
			repeatCount="indefinite"/>`);
		for(let j=0; j < 2; ++j) {

		
			for(let i =0; i < hexPerRow; ++i) {

				//do a hexagon of 6 triangles every iteration, try animating in the process
				
				//divide into 3 triangle-pairs 
				var d1 = `M${pt1.x},${pt1.y} l${length},${-length} l${-2*length},0 l${length},${length}`
				var d2 = `M${pt1.x},${pt1.y} l${-length},${length} l${2*length},0 l${-length},${-length}`


				var d3 = `M${pt1.x},${pt1.y} l${2*length},0 l${-length},${-length} l${-length},${length}`
				var d4 = `M${pt1.x},${pt1.y} l${-2*length},0 l${length},${length} l${length},${-length}`

				var d5 = `M${pt1.x},${pt1.y} l${length},${length} l${length},${-length} l${-2*length},0`
				var d6 = `M${pt1.x},${pt1.y} l${-length},${-length} l${-length},${length} l${2*length},0`


				var peripheral_d7 = `M${pt1.x-2*length},${pt1.y} l${length},${-length} l${-2*length},0 l${length},${length}`
				var peripheral_d8 = `M${pt1.x-2*length},${pt1.y} l${-length},${length} l${2*length},0 l${-length},${-length}`
				//
				
				let colorStep1 = `hsl(220, 50%, 50%)`
				
				let colorStep2 = `hsl(220, 50%, 100%)`
				
				let delayString = (x) =>{return `begin="${((x+i))/(12)}s"  />`}
				let currentAnimation = `<animate  attributeName="fill" values="${colorStep1};${colorStep2};${colorStep1}" dur="1s" repeatCount="indefinite" keyTimes="0 ;.5; 1" `
				//var animate1 = document.createElementNS("http://www.w3.org/2000/svg", "animate");
				

				var tri1 = document.createElementNS("http://www.w3.org/2000/svg","path");		//1st (clock-wise)
				tri1.setAttribute("d",d1);
				tri1.setAttribute("stroke",'rgb(0,0,0)');
				tri1.setAttribute("strokeWidth","2");
				tri1.setAttribute("fill",'hsl(220,50%, 25%');
				tri1.insertAdjacentHTML('beforeend',currentAnimation + delayString(4));
				

				
			
				var tri2 = document.createElementNS("http://www.w3.org/2000/svg","path");		//4th
				tri2.setAttribute("d",d2);
				tri2.setAttribute("stroke",'rgb(0,0,0)');
				tri2.setAttribute("strokeWidth","2");
				tri2.setAttribute("fill",'hsl(220,50%, 25%');
				tri2.insertAdjacentHTML('beforeend',currentAnimation + delayString(6));
				


				var tri3 = document.createElementNS("http://www.w3.org/2000/svg","path");		//2nd
				tri3.setAttribute("d",d3);
				tri3.setAttribute("stroke",'rgb(0,0,0)');
				tri3.setAttribute("strokeWidth","2");
				tri3.setAttribute("fill",'hsl(220,50%, 25%');
				tri3.insertAdjacentHTML('beforeend',currentAnimation + delayString(4));
				

				var tri4 = document.createElementNS("http://www.w3.org/2000/svg","path");		//5th
				tri4.setAttribute("d",d4);
				tri4.setAttribute("stroke",'rgb(0,0,0)');
				tri4.setAttribute("strokeWidth","2");
				tri4.setAttribute("fill",'hsl(220,50%, 25%');
				tri4.insertAdjacentHTML('beforeend',currentAnimation + delayString(6));			
				

				var tri5 = document.createElementNS("http://www.w3.org/2000/svg","path");	//3rd
				tri5.setAttribute("d",d5);
				tri5.setAttribute("stroke",'rgb(0,0,0)');
				tri5.setAttribute("strokeWidth","2");
				tri5.setAttribute("fill",'hsl(220,50%, 25%');
				tri5.insertAdjacentHTML('beforeend',currentAnimation + delayString(4));
				

				
				var tri6 = document.createElementNS("http://www.w3.org/2000/svg","path");		//6th
				tri6.setAttribute("d",d6);
				tri6.setAttribute("stroke",'rgb(0,0,0)');
				tri6.setAttribute("strokeWidth","2");
				tri6.setAttribute("fill",'hsl(220,50%, 25%');
				tri6.insertAdjacentHTML('beforeend',currentAnimation + delayString(6));
				
				
				var pTri7 = document.createElementNS("http://www.w3.org/2000/svg","path");		
				pTri7.setAttribute("d",peripheral_d7);
				pTri7.setAttribute("stroke",'rgb(0,0,0)');
				pTri7.setAttribute("strokeWidth","2");
				pTri7.setAttribute("fill",'hsl(220,50%, 25%');
				pTri7.insertAdjacentHTML('beforeend',currentAnimation + delayString(1));
				


				var pTri8 = document.createElementNS("http://www.w3.org/2000/svg","path");
				pTri8.setAttribute("d",peripheral_d8);
				pTri8.setAttribute("stroke",'rgb(0,0,0)');
				pTri8.setAttribute("strokeWidth","2");
				pTri8.setAttribute("fill",'hsl(220,50%, 25%');
				pTri8.insertAdjacentHTML('beforeend',currentAnimation + delayString(2));
				

				triangleGroup.appendChild(tri1);
				triangleGroup.appendChild(tri2);
				triangleGroup.appendChild(tri3);
				triangleGroup.appendChild(tri4);
				triangleGroup.appendChild(tri5);
				triangleGroup.appendChild(tri6);
				triangleGroup.appendChild(pTri7);
				triangleGroup.appendChild(pTri8);

				pt1.x+=4*length;
				

			}
			pt1.x =  xOrigin;
			
			pt1.y+=2*length;
			
		}


	}
	render() {
		// <path d="M0,0 l50,50 l50,-50 l-100,0" > 
				
		// 					</path> 
		return (	
			<Container id='navBarContainer'>
				<Container id="coverSVGContainer" style={{overflow:'hidden'}}>
					<svg id="coverSVG" height="100%" width="100%" style={{pointerEvents:'none'}}>
						<g id="triangleGroup" transform="matrix(1 0 0 1 0 0)" > 
							
						</g> 
					</svg>
				</Container>
				

				<Menu id="navBar" className="nav-menu">
					<Link to="/" className="nav-link item">Home</Link>
					<Link to="/fileload" className="nav-link item">File Load</Link>
					<Link to="/animation" className="nav-link item">Animation</Link>
					<Link to="/game" className="nav-link item">Game</Link>
					
					<Dropdown item text="Tools">
						<Dropdown.Menu>
							<Dropdown.Item text="Calculator" onClick={this.toggleCalculator}/>
						</Dropdown.Menu>
					</Dropdown>
					<Menu.Item className="nav-item" position='right'>
						<Button compact id='openSettings' onClick={this.toggleSettings}>
							<i className="icon cog"/>
						</Button> 
					</Menu.Item>
					
				</Menu>
			</Container>
			
		  );
	}
	// <div class="nav-item item">
	// 					<Button compact id='openSettings' onClick={this.toggleSettings}>
	// 						<i className="icon cog"/>
	// 					</Button> 
	// 				</div>

	// render() {
	// 	return (	
	// 		<Menu id="navBar" className="nav-menu vertical">
	// 			<Container>
	// 				<Link to="/" className="nav-link vertical">Home</Link>
	// 				<Link to="/fileload" className="nav-link vertical">File Load</Link>
	// 				<Link to="/animation" className="nav-link vertical">Animation</Link>
	// 				<Link to="/game" className="nav-link vertical">Game</Link>
					
	// 				<div className="nav-item">
	// 					<Button className="navBarButton" id='openCalc' onClick={this.toggleCalculator}>Calculator</Button> 
	// 				</div>
					
	// 				<div class="nav-item">
	// 					<Button className="navBarButton" id='openSettings'  onClick={this.toggleSettings}>
	// 						<Icon id="settingsIcon" name="cog" />
	// 					</Button> 
	// 				</div>
							
	// 			</Container>
	// 		</Menu>
	// 	  );
	// }

}

NavBar.childContextTypes = {
	toggleSettings: PropTypes.func,
	toggleCalculator: PropTypes.func,
}


export default NavBar;
