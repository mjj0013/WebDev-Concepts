import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Header, Container, Divider, Icon,Button, Dropdown } from 'semantic-ui-react';


import './layout.css';

import Home from './Home'

import PropTypes from 'prop-types';




class Triangle {
	constructor(xPhase, yPhase, pts) {
		
		this.pts = pts;
		
		this.xPhase = xPhase	//denotes the phase of animation it participates in
		this.yPhase = yPhase;

		
	}
}



class NavBar extends React.Component {
	constructor(props) {
		super(props);
		this.toggleSettings = this.toggleSettings.bind(this);
		this.toggleCalculator = this.toggleCalculator.bind(this);
		this.getChildContext = this.getChildContext.bind(this);

		this.canvasRef = React.createRef();
        this.contextRef = React.createRef();
		
		this.update = this.update.bind(this);


		this.waveform1 = this.waveform1.bind(this);

		this.coverTransformMatrix =  [1, 0, 0, 1, 0, 0];
		this.currentZoom = 2;
		
		
		this.intervals = [];

		this.loadTriangle = this.loadTriangle.bind(this);
		this.startAnimation = this.startAnimation.bind(this);
		this.coverTriangles = [];
		this.xSortedCoverTriangles = []
		this.ySortedCoverTriangles = []
		this.step =0;
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
		this.contextRef.current = this.canvasRef.current.getContext("2d");
		var canvas = document.getElementById("coverCanvas");
		
		canvas.width = canvas.height * (canvas.clientWidth / canvas.clientHeight);
		this.startAnimation();
		
		window.onresize = () => {
			var canvas = document.getElementById("coverCanvas");
			canvas.width = canvas.height * (canvas.clientWidth / canvas.clientHeight);
			this.startAnimation();
		}


		// setInterval(this.update,1000/60);
		window.requestAnimationFrame(this.update);
		
	}

	waveform1(t) {
		var x  = 15*t*(180/Math.PI)/(300000);
		
		return 80*Math.sin(x)
		

	}

	update() {
		console.log("this.ySortedCoverTriangles.length",this.ySortedCoverTriangles.length)
		// for(let phase=0; phase < this.ySortedCoverTriangles.length;++phase) {
		// 	var triangles = this.ySortedCoverTriangles[phase]
		// 	triangles.value = Math.max(this.waveform1(this.step*phase), 25);
			
		// 	for(let a=0; a < triangles.indices.length; ++a) {
		// 		var Tri = this.coverTriangles[triangles.indices[a]];
		// 		this.contextRef.current.beginPath();
		// 		this.contextRef.current.moveTo(Tri.pts[0].x,Tri.pts[0].y);
		// 		this.contextRef.current.lineTo(Tri.pts[1].x,Tri.pts[1].y);
		// 		this.contextRef.current.lineTo(Tri.pts[2].x,Tri.pts[2].y);
		// 		this.contextRef.current.lineTo(Tri.pts[0].x,Tri.pts[0].y);
		// 		this.contextRef.current.closePath();
		// 		this.contextRef.current.fillStyle = `hsl(220, 50%, ${triangles.value}%)`;
		// 		this.contextRef.current.fill();
		// 		this.contextRef.current.stroke();
				
		// 	}	
			
		// }
		
		for(let phase=0; phase < this.xSortedCoverTriangles.length;++phase) {
			var triangles = this.xSortedCoverTriangles[phase]
			triangles.value = Math.max(this.waveform1(this.step*phase), 25);
			
			for(let a=0; a < triangles.indices.length; ++a) {
				var Tri = this.coverTriangles[triangles.indices[a]];
				this.contextRef.current.beginPath();
				this.contextRef.current.moveTo(Tri.pts[0].x,Tri.pts[0].y);
				this.contextRef.current.lineTo(Tri.pts[1].x,Tri.pts[1].y);
				this.contextRef.current.lineTo(Tri.pts[2].x,Tri.pts[2].y);
				this.contextRef.current.lineTo(Tri.pts[0].x,Tri.pts[0].y);
				this.contextRef.current.closePath();
				this.contextRef.current.fillStyle = `hsl(220, 50%, ${triangles.value}%)`;
				this.contextRef.current.fill();
				this.contextRef.current.stroke();
			}	
		}

		++this.step;

		window.requestAnimationFrame(this.update);

	}
	loadTriangle(t) {
		// console.log('t',t);
		console.log(t)
		if(t.pts == undefined) return;
		this.contextRef.current.beginPath();
		this.contextRef.current.moveTo(t.pts[0].x, t.pts[0].y);
		this.contextRef.current.lineTo(t.pts[1].x, t.pts[1].y);
		this.contextRef.current.lineTo(t.pts[2].x, t.pts[2].y);
		this.contextRef.current.lineTo(t.pts[0].x, t.pts[0].y);
		this.contextRef.current.closePath();
		this.contextRef.current.fillStyle = `hsl(220, 50%, 50%)`;
		this.contextRef.current.fill();
		this.contextRef.current.stroke();

	}
	startAnimation() {
        let hexPerRow = 20;
        let length = 25;
        var pt1 = {x:50,y:0};
		
        let xOrigin = pt1.x;
        

		this.xSortedCoverTriangles = Array(hexPerRow*2).fill(0);
        this.ySortedCoverTriangles = Array(hexPerRow*2).fill(0);
        for(let j=0; j < 4; ++j) {
            for(let i =0; i < hexPerRow; ++i) {
				// 2*i+1		sub phase 1 
				// 2*i+2		sub phase 2

				var peripheralPt = {x:pt1.x-2*length, y:pt1.y}


				this.coverTriangles.push(new Triangle(2*i+2,2*i+1, [{x:pt1.x, y:pt1.y}, {x:pt1.x+length, y:pt1.y-length}, {x:pt1.x-length, y:pt1.y-length}] ))
				this.coverTriangles.push(new Triangle(2*i+1,2*i+2, [{x:pt1.x, y:pt1.y}, {x:pt1.x-length, y:pt1.y+length}, {x:pt1.x+length, y:pt1.y+length}] ))
				this.coverTriangles.push(new Triangle(2*i+2,2*i+1, [{x:pt1.x, y:pt1.y}, {x:pt1.x+2*length, y:pt1.y},      {x:pt1.x+length, y:pt1.y-length}] ))
				this.coverTriangles.push(new Triangle(2*i+1,2*i+2,[{x:pt1.x, y:pt1.y}, {x:pt1.x-2*length, y:pt1.y},      {x:pt1.x-length, y:pt1.y+length}] ))
				this.coverTriangles.push(new Triangle(2*i+2,2*i+1, [{x:pt1.x, y:pt1.y}, {x:pt1.x+length, y:pt1.y+length}, {x:pt1.x+2*length, y:pt1.y}] ));
				this.coverTriangles.push(new Triangle(2*i+1,2*i+2, [{x:pt1.x, y:pt1.y}, {x:pt1.x-length, y:pt1.y-length}, {x:pt1.x-2*length, y:pt1.y}] ));
				this.coverTriangles.push(new Triangle(2*i+2,2*i+1, [{x:peripheralPt.x, y:peripheralPt.y}, {x:peripheralPt.x+length, y:peripheralPt.y-length}, {x:peripheralPt.x-length, y:peripheralPt.y-length}] ));
				this.coverTriangles.push(new Triangle(2*i, 2*i+2,[{x:peripheralPt.x, y:peripheralPt.y}, {x:peripheralPt.x-length, y:peripheralPt.y+length}, {x:peripheralPt.x+length, y:peripheralPt.y+length}] ));
               
                pt1.x+=4*length;
            }
            pt1.x = xOrigin;
            pt1.y+=2*length;
        }
		
		
        for(let i =0; i < this.coverTriangles.length;++i) {
			var triangle = this.coverTriangles[i];
			if(typeof this.xSortedCoverTriangles[triangle.xPhase]=='number') {
				this.xSortedCoverTriangles[triangle.xPhase] = {indices:[i], value:50}
			}
			else if(typeof this.xSortedCoverTriangles[triangle.xPhase]=='object') this.xSortedCoverTriangles[triangle.xPhase].indices.push(i);
			

			if(typeof this.ySortedCoverTriangles[triangle.yPhase]=='number') {
				this.ySortedCoverTriangles[triangle.yPhase] = {indices:[i], value:50}
			}
			else if(typeof this.ySortedCoverTriangles[triangle.yPhase]=='object') this.ySortedCoverTriangles[triangle.yPhase].indices.push(i);
			

            this.loadTriangle(triangle);
        }
		console.log("this.ySortedCoverTriangles",this.ySortedCoverTriangles);

    }

	render() {
		//<div id="coverCanvasContainer" style={{overflow:'hidden'}}>
		// <path d="M0,0 l50,50 l50,-50 l-100,0" > 
				
		// 					</path> 
		return (	
			<Container id='navBarContainer'>
				
					<canvas ref={this.canvasRef }id="coverCanvas" width="100%" />
					

				
				

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
