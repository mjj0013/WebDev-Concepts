import React from 'react';
import { Link } from 'react-router-dom';

import Layout from './Layout';
import { Header, Container, Divider, Icon } from 'semantic-ui-react';
import './layout.css';





import bg_image from "../img/bridge.jpeg";



class Home extends React.Component {

	constructor(props) {
		super(props);


		this.bgCanvasRef = React.createRef();		//background canvas reference
        this.bgContextRef = React.createRef();		//background context reference
		this.mouseClickHandler = this.mouseClickHandler.bind(this);
	}

	

	mouseClickHandler = (canvas,e) =>{
		
		
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        /*this.physicalObjectMap.forEach((item,index) => {
                var isInside = false
                var item = this.physicalObjects[index];
                if(item.controllable==true) {
                    if((x >= item.x-item.radius) && (x <= item.x+item.radius)) {
                        if((y >= item.y-item.radius) && (y <= item.y+item.radius)) {
                            isInside=true;
                            this.controlledObjectIndex = index;
                        }
                    }
                }
        });*/
        
        console.log("Mouse click.. x: " + x + ", y: " + y)
        
    }

	componentDidMount = () => {
		this.bgCanvasRef.current.addEventListener('mousedown', (e) => {this.mouseClickHandler(this.bgCanvasRef.current,e)});
		this.bgContextRef.current = this.bgCanvasRef.current.getContext('2d');

		
		var image = new Image();
		image.onload = () => {
			this.bgCanvasRef.current.height = this.bgCanvasRef.current.width * (image.height/image.width);


			var temp_canvas = document.createElement('canvas');
			var temp_context = temp_canvas.getContext('2d');
			temp_canvas.width = image.width * 0.5;
			temp_canvas.height = image.height * 0.5;
			temp_context.drawImage(image, 0, 0, temp_canvas.width, temp_canvas.height);
			temp_canvas.width = image.width * 0.5;
			temp_canvas.height = image.height * 0.5;
			temp_context.drawImage(image, 0, 0, temp_canvas.width, temp_canvas.height);

			// step 2
			temp_context.drawImage(temp_canvas, 0, 0, temp_canvas.width * 0.5, temp_canvas.height * 0.5);


			this.bgContextRef.current.drawImage(temp_canvas, 0, 0, temp_canvas.width * 0.5, temp_canvas.height * 0.5,
				0, 0, this.bgCanvasRef.current.width, this.bgCanvasRef.current.height);


			this.bgContextRef.current.drawImage(temp_canvas, 0, 0, temp_canvas.width * 0.5, temp_canvas.height * 0.5,
				0, 0, this.bgCanvasRef.current.width, this.bgCanvasRef.current.height);

		
		}
		image.src="../img/bridge.jpeg";

		
		
		
		
		

		

	}
	//<canvas class="home-widget"> </canvas>
	//<img class="backgroundImage" src={image} />
	
	render() {
		return (
			<Container>
				
				
					<canvas ref={this.bgCanvasRef} className="backgroundCanvas" id="bgCanvas" width="1200px" height="675px"></canvas>
				
				
				
	
				<Layout title="Home" description="asdfasfd">
					<Header as="h2">This is the home page</Header>
					<p>This is a description about the home page.</p>
					
					
				</Layout>
			</Container>
			
		  );
	}
}


export default Home;


