import React, {useRef} from 'react';

import {Table, Header, Container, Divider, Icon, ItemContent } from 'semantic-ui-react';

import Layout from '../Layout';
import "regenerator-runtime/runtime";

import BackgroundEffect from './BackgroundEffect';
import PhysicalObject from './PhysicalObject';
//import ObjTable from './ObjTable.js';
import "../utility.js"
import { getRandomInt } from '../utility.js';
class Game extends React.Component {
    
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
        this.contextRef = React.createRef();
        this.draw = this.draw.bind(this);
        this.update = this.update.bind(this);
        this.initWorld = this.initWorld.bind(this);

        this.moveRight = this.moveRight.bind(this);
        this.moveLeft = this.moveLeft.bind(this);
        this.moveUp = this.moveUp.bind(this);
        this.moveDown = this.moveDown.bind(this);
        this.moveSpin = this.moveSpin.bind(this);
        this.addPhysicalObject = this.addPhysicalObject.bind(this);
        this.clearWorld = this.clearWorld.bind(this);
        this.renderTable = this.renderTable.bind(this);
        this.mouseClickHandler = this.mouseClickHandler.bind(this);
        this.saveStates = this.saveStates.bind(this);
        this.loadExistingItems = this.loadExistingItems.bind();
        this.changeHue = this.changeHue.bind(this);
        this.xChangeLightPosition = this.xChangeLightPosition.bind(this);
        this.yChangeLightPosition = this.yChangeLightPosition.bind(this);
        this.changeBackgroundShades = this.changeBackgroundShades.bind(this);
        this.resizeButtonClicked = this.resizeButtonClicked.bind(this);

        this.numOfBackgroundShades = 5;
        this.changeGravityDirection = this.changeGravityDirection.bind(this);
        this.physicalObjects = [];
        this.controlledObjectIndex = -1;
        this.physicalObjectMap = [];

        this.insertRandomizedOrb= this.insertRandomizedOrb.bind(this);
       
        this.canvasWidth = 800;
        this.canvasHeight = 600;

        this.xLightSource = this.canvasWidth;
        this.yLightSource = this.canvasHeight;
        this.rLightSource = 200; 

        this.backgroundHue = 180;
        this.backgroundSaturation = 80;
        this.backgroundLightness = 95;


        this.userExertion = 5;      //was 10
        this.grid_length = 75;

        this.fromLocation = null;


        this.xGlobalForce = 0.0;
        this.yGlobalForce = 0.0;

        this.closeDragElement = this.closeDragElement.bind(this);
        this.elementDrag = this.elementDrag.bind(this);
        this.dragMouseDown = this.dragMouseDown.bind(this);
        this.makeDraggable = this.makeDraggable.bind(this);
        this.updateZoom = this.updateZoom.bind(this);
        this.captureZoomEvent = this.captureZoomEvent.bind(this)
        this.zoomIntensity = 0.2;
        this.zoomHasHappened = 0;
        this.contextCurrentOrigin = {x:0,y:0}
        this.zoomPos = {x:0, y:0}
        this.canvasScale = 1;
    }

    closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }

    elementDrag(e) {    
        e = e || window.event;
        e.preventDefault();
        
        this.posPrediction.pos1 = this.posPrediction.pos3 - e.clientX;
        this.posPrediction.pos2 = this.posPrediction.pos4 - e.clientY;

        this.posPrediction.pos3 = e.clientX;
        this.posPrediction.pos4 = e.clientY;


        let gameCanvas = document.getElementById("gameCanvas");

       
        resizeButton.style.top = (resizeButton.offsetTop - this.posPrediction.pos2) + "px";
        resizeButton.style.left = (resizeButton.offsetLeft - this.posPrediction.pos1) + "px";
        
        
        gameCanvas.style.height = (gameCanvas.offsetTop - this.posPrediction.pos2) + "px";
        gameCanvas.style.width = (gameCanvas.offsetLeft - this.posPrediction.pos1) + "px";


        let originalCanvasX = gameCanvas.left;
        let originalCanvasY = gameCanvas.top;
        console.log(originalCanvasX +"  "+ originalCanvasY)

        let xMag =  (resizeButton.offsetLeft - this.posPrediction.pos1)/(gameCanvas.offsetLeft - this.posPrediction.pos1);
        let yMag =  (resizeButton.offsetTop - this.posPrediction.pos2)/(gameCanvas.offsetTop - this.posPrediction.pos2);
        
        console.log("mags: "+xMag+" "+yMag)
        if(gameCanvas.top != originalCanvasY) {
            gameCanvas.style.transform =`scaleY(${yMag})`;
        }
        if(gameCanvas.left != originalCanvasX) {
            gameCanvas.style.transform =`scaleX(${xMag})`;
        }
      
        return false;
    }

    dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        this.posPrediction.pos3 = e.clientX;
        this.posPrediction.pos4 = e.clientY;
        document.onmouseup = this.closeDragElement;
        document.onmousemove = this.elementDrag;
    }

    makeDraggable(item_id) {
        var item = document.getElementById(item_id)
        this.posPrediction = {pos1:0, pos2:0, pos3: 0, pos4:0}
        item.onmousedown = this.dragMouseDown;
    }



    changeHue = (event) =>{
        this.backgroundHue = event.target.value;
    }
    xChangeLightPosition=  (event) => {
        this.xLightSource = event.target.value;
    }
    yChangeLightPosition = (event) => {
        this.yLightSource = event.target.value;
    }

    

    addBackgroundEffect(x,y,dx,dy,mass,radius,color) {
        const context = this.canvasRef.current.getContext('2d');

        this.backgroundEffects.push(new BackgroundEffect(this, context, x,y, dx,dy,mass,radius,color));

    }
    initWorld = () =>{
        this.addPhysicalObject("user-ellipse", 50,50,25,25,0,0,25,'rgb(24,210,24)',true);
        this.addPhysicalObject("user-ellipse",150,50,25,25,0,0,25,'rgb(150,90,24)', true);
        this.addPhysicalObject("user-ellipse",50,150,25,25,0,0,25,'rgb(54,76,24)', true);
        this.addPhysicalObject("user-ellipse",400,150,25,25,0,0,25,'rgb(54,76,24)', true);
        this.addPhysicalObject("user-ellipse",500,150,25,25,0,0,25,'rgb(54,76,24)', true);
        this.addPhysicalObject("world-rectangle-stationary",200,300,25,100,0,0,25,'rgb(54,76,24)',true);
        this.addPhysicalObject("user-ellipse",50,400,25,25,0,0,25,'rgb(54,76,24)'), true;
        this.addPhysicalObject("user-ellipse",160,150,25,25,0,0,25,'rgb(54,76,24)', true);
        this.addPhysicalObject("user-ellipse",400,400,25,25,0,0,25,'rgb(54,76,24)',true );
        this.addPhysicalObject("user-ellipse",400,75,25,25,0,0,25,'rgb(54,76,24)',true);
        
        //this.addBackgroundEffect(100,100,0,0,100,25,'rgb(54,76,24)');
        //by default, select the first object that can be controlled as the current controlled object.
        for(var i=0; i < this.physicalObjects.length; ++i) {
            if(this.physicalObjects.at(i).controllable) {
                this.controlledObjectIndex = i;
                break;
            }
        }
    }
    
    addPhysicalObject = (obj_type,x,y, width, height,dx,dy,mass,color,isNew=true) =>{
        ++this.controlledObjectIndex;
      

        
        var obj = {
            index:this.controlledObjectIndex,
            x:x,
            y:y,
            width:width,
            height:height,
            dx:dx,
            dy:dy,
            mass:mass,
            color:color,
            obj_type:obj_type
        }

        
        this.physicalObjectMap.push(obj);

        if(isNew) {
            localStorage.physicalObjectMap = JSON.stringify(this.physicalObjectMap);
            this.physicalObjects.push(new PhysicalObject(this,  this.contextRef.current,  obj_type, x,y, width, height, dx,dy,mass,null));

        }
        else {
            console.log("new length: "+ this.physicalObjects.length);
            console.log(this.controlledObjectIndex);
        }
    }

    captureZoomEvent = (e) => {
        this.zoomPos.x = e.clientX - this.canvasRef.current.offsetLeft;
        this.zoomPos.y = e.clientY - this.canvasRef.current.offsetTop;

        this.zoomHasHappened = 1;

        this.zoomDeltaY = e.deltaY

    }
    updateZoom = () => {
        let wheelNorm = this.zoomDeltaY < 0 ? 1: -1;

        let zoomVar = Math.exp(wheelNorm*this.zoomIntensity);
        this.contextRef.current.translate(this.contextCurrentOrigin.x,this.contextCurrentOrigin.y);
        
        this.contextCurrentOrigin.x -= this.zoomPos.x/(this.canvasScale*zoomVar) - this.zoomPos.x/this.canvasScale;
        this.contextCurrentOrigin.y -= this.zoomPos.y/(this.canvasScale*zoomVar) - this.zoomPos.y/this.canvasScale;

        // this.contextRef.current.scale(zoomVar, zoomVar);
        this.contextRef.current.translate(-this.contextCurrentOrigin.x, -this.contextCurrentOrigin.y);
        this.canvasScale *= zoomVar;
       

        
        console.log("canvas dims: ")
        // this.canvasWidth *= this.canvasScale;
        // this.canvasHeight *= this.canvasScale;
        this.canvasRef.current.width *= this.canvasScale;
        this.canvasRef.current.height *= this.canvasScale;
        //this.canvasRef.current.width = 
        console.log(this.canvasRef.current.width + "  " + this.canvasRef.current.height)
        // this.clearWorld();

        this.zoomHasHappened = 0;
        
    }
    moveDown = () => {
        this.physicalObjects[this.controlledObjectIndex].yVelocity = 
                this.physicalObjects[this.controlledObjectIndex].yVelocity + this.userExertion;
        //console.log(this.physicalObjectMap);
    };

    moveSpin = () => {
        this.physicalObjects[this.controlledObjectIndex].angularAccel = 60;
        this.physicalObjects[this.controlledObjectIndex].rotating = true;
        //console.log("ang vel:  "+ this.physicalObjects[this.controlledObjectIndex].angularVelocity);
    }
   
    moveUp = () => {
        this.physicalObjects[this.controlledObjectIndex].yVelocity = 
                this.physicalObjects[this.controlledObjectIndex].yVelocity - this.userExertion;
    };
    moveLeft = () => {
        
        this.physicalObjects[this.controlledObjectIndex].xVelocity = 
                this.physicalObjects[this.controlledObjectIndex].xVelocity - this.userExertion;
    };
    moveRight = () => {
        this.physicalObjects[this.controlledObjectIndex].xVelocity = 
                this.physicalObjects[this.controlledObjectIndex].xVelocity + this.userExertion;
                
    };
    

    saveStates = () => {

        console.log("saved: " + JSON.stringify(this.physicalObjectMap));
        for(var i=0; i < this.physicalObjectMap.length; ++i) {
            console.log("obj"+i+": x "+  this.physicalObjectMap[i].x)
        }
        localStorage.physicalObjectMap = JSON.stringify(this.physicalObjectMap);
    }

    loadExistingItems = () => {
        var existing_items = JSON.parse(localStorage.physicalObjectMap);
        console.log('existing_items: ' + localStorage.physicalObjectMap); 
        console.log("num of existing items: " +existing_items.length )
        
        this.physicalObjects = [];
        this.physicalObjectMap = [];
        for(var i=0; i < existing_items.length; ++i) {
            
            this.addPhysicalObject(
                existing_items[i].obj_type,
                existing_items[i].x,
                existing_items[i].y,
                existing_items[i].width,
                existing_items[i].height,
                existing_items[i].dx,
                existing_items[i].dy,
                existing_items[i].mass,
                existing_items[i].color,
                true
            );
        }
        
        console.log("this.physicalObjects.length: " + this.physicalObjects.length);
        
    }
    componentDidUpdate = () => {
        this.contextRef.current = this.canvasRef.current.getContext('2d');
        
        setInterval(
            () => {
            this.update();
            if(this.zoomHasHappened==1) this.updateZoom();
            this.clearWorld();
            
            this.draw();
        }, 1000/60);

    }
    componentDidMount = () => {
        document.getElementById("gameCanvas").addEventListener("wheel",this.captureZoomEvent);
        this.makeDraggable('gameCanvas');
        setInterval(
            () => {
            this.update();
            if(this.zoomHasHappened==1) this.updateZoom();
            this.clearWorld();
            
            this.draw();
        }, 1000/60);
          
        
        this.canvasRef.current.addEventListener('mousedown', (e) => {this.mouseClickHandler(this.canvasRef.current,e)});
        

        if(localStorage.first==null) {
            console.log("loading for first time");
            localStorage.first ='1';         //the first time loading
            this.initWorld();
            this.fromLocation = "/game";
        }

        this.unlisten = this.props.history.listen((location, action) => {
            console.log(window.location.pathname);

            if(localStorage.first != null) {     //not the first time loading (items already saved)
                if(this.fromLocation =="/game") {
                    this.saveStates();
                }
                
                if(window.location.pathname == "/game") {
                    this.loadExistingItems();
                    this.fromLocation = "/game";
                }
                
                this.fromLocation = window.location.pathname; 
            }   
          });

        window.addEventListener("keydown", 
            (e) =>{
                
                switch(e.code) {
                    

                    case "ArrowLeft":
                        this.moveLeft();
                        break;

                    case "ArrowRight":
                        this.moveRight();
                        break;

                    case "ArrowUp":
                        this.moveUp();
                        break;

                    case "ArrowDown":
                        this.moveDown();
                        break;

                    case "KeyR":
                        this.moveSpin();
                        break;

                    
                }
            }
        );
        
        
        let canvasResizeButton = document.getElementById('gameCanvasResizeButton');
        let gameCanvas = document.getElementById('gameCanvas');
        canvasResizeButton.style.top = '83vh';
        canvasResizeButton.style.left = '75vw';

    }
    
    update = () =>{  

        if(this.canvasRef.current!=null) {this.contextRef.current = this.canvasRef.current.getContext('2d');}
        this.physicalObjects.forEach((obj,index) => {
            obj.update();
            
            this.physicalObjectMap[index].x = obj.x;
            this.physicalObjectMap[index].y = obj.y;
            this.physicalObjectMap[index].dx = obj.xVelocity;
            this.physicalObjectMap[index].dy = obj.yVelocity;

        })

    }
    
    clearWorld = () => {
        //this.canvasRef.current.getContext('2d').clearRect(0,0,this.canvasRef.current.width, this.canvasRef.current.height);

    
        var gradient = this.contextRef.current.createRadialGradient(
            this.canvasWidth,this.canvasHeight,this.rLightSource,  
            this.canvasWidth,300,this.canvasHeight);
            
      
        
        var num_stops = this.numOfBackgroundShades;
        var d_offset = 2.5;
        for(var s=1; s < num_stops; ++s) {
            gradient.addColorStop(Math.min(s/num_stops,1.0), 'hsl('
            +(this.backgroundHue)+','
            +this.backgroundSaturation*(s/num_stops)%100+'%,'
            +(this.backgroundLightness*(1.0-s/num_stops)%100)+'%)');
        }
        
        
        this.contextRef.current.fillStyle = gradient;
        this.contextRef.current.fillRect(0,0,this.canvasWidth,this.canvasHeight);
    }
    draw = () => {
        //this.contextRef.current.fillStyle = "black";
       
        //this.contextRef.current.fillRect(0, 0, this.contextRef.current.width,   this.contextRef.current.height); 
        
        this.physicalObjects.forEach(obj => {
            
            obj.draw();
            
        }) 
    }
    renderTable() {
        let newRows = this.physicalObjectMap.map((obj) => {
            return (
                <Table.Row key={obj[0]}>
                    <Table.Cell title={obj[0]}>{obj[0]} </Table.Cell>
                    <Table.Cell title={obj[1]}>{obj[1]} </Table.Cell>
                    <Table.Cell title={obj[2]}>{obj[2]} </Table.Cell>
                    <Table.Cell title={obj[3]}>{obj[3]} </Table.Cell>
                    <Table.Cell title={obj[4]}>{obj[4]} </Table.Cell>
                    <Table.Cell title={obj[5]}>{obj[5]} </Table.Cell>
                    <Table.Cell title={obj[6]}>{obj[6]} </Table.Cell>

                </Table.Row>

            );
        });
        return newRows;
    }

    mouseClickHandler = (canvas,e) =>{
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top




        this.physicalObjectMap.forEach((item,index) => {
                var isInside = false
                var item = this.physicalObjects[index];
                if(item.controllable==true) {

                    if(item.shape == 'ellipse') {
                        if((x >= item.x-item.radius) && (x <= item.x+item.radius)) {
                            if((y >= item.y-item.radius) && (y <= item.y+item.radius)) {
                                isInside=true;
                                this.controlledObjectIndex = index;
                            }
                        }

                    }
                    else if(item.shape == 'rectangle') {
                        if((x >= item.x) && (x <= item.x+item.width)) {
                            if((y >= item.y) && (y <= item.y+item.height)) {
                                isInside=true;
                                this.controlledObjectIndex = index;
                            }
                        }
                    }

                    
                }
        })
        
        console.log("x: " + x + " y: " + y)
        
    }

    insertRandomizedOrb = () =>{
        
        var mass = getRandomInt(5,200);

        var foundSpot = false;
        var x,y,radius;
        var tempObj;

        var maxMassReducer = 5;

        var num_of_failures = 0;
        while(foundSpot==false) {
            if(num_of_failures >50) {console.log("Too many attempts. Try again."); return;}

            radius = getRandomInt(5,75-Math.max(maxMassReducer*num_of_failures, 25));
            x = getRandomInt(radius,this.canvasWidth-radius);
            y = getRandomInt(radius,this.canvasHeight-radius);
            

            for(var i=0; i < this.physicalObjects; ++i) {
                tempObj = new PhysicalObject(this,this.contextRef.current,"user-ellipse",x,y,radius,radius,0,0,mass,null);

                var collides = this.physicalObjects[i].circle2circle(this.physicalObjects[i], tempObj);
                if(collides) {
                    ++num_of_failures;
                    break;
                }
            }
            foundSpot = true;
        }    
        this.addPhysicalObject("user-ellipse",x,y,radius,radius,0,0,mass,null);
        

            

    }

    changeGravityDirection() {
        var gravitySelect = document.getElementById("gravityDirection");
        console.log(gravitySelect.value);
        switch(gravitySelect.value) {
            
            case("Up"): {
                console.log("up detected");
                this.yGlobalForce = -.5;
                this.xGlobalForce = 0;
                break;
            }
            case("Down"): {
                console.log("down detected");
                this.yGlobalForce = .5;
                this.xGlobalForce = 0;
                break;
            }
            case("Left"): {
                console.log("left detected");
                this.xGlobalForce = -.5;
                this.yGlobalForce = 0;
                break;
            }
            case("Right"): {
                console.log("right detected");
                this.xGlobalForce = .5;
                this.yGlobalForce = 0;
                break;
            }
            case("None"): {
                console.log("none detected");
                this.xGlobalForce = 0.0;
                this.yGlobalForce = 0.0;
                break;

            }
        }
    }
    changeBackgroundShades(event) {
        this.numOfBackgroundShades = event.target.value;
    }

    resizeButtonClicked(e) {
        console.log("resize clicked");
        const rect = this.canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
    }

    render = () =>{


        return (
            <Layout title="Game Page" description="A description about the game">
                <Container>
                    <Header as="h3">Another header</Header>
                </Container>
               
                <Container id="viewAndHeader">
                    <canvas id="gameCanvas" ref={this.canvasRef} width={this.canvasWidth} height={this.canvasHeight} className="gameCanvas"></canvas>
                    <div id="gameCanvasResizeButton" className="gameCanvasResizeButton" onFocus={this.resizeButtonClicked} tabIndex="100" />
                </Container>
                
                

                <Container id="gameControlPanel">
                    <button id="addOrbButton" onClick={this.insertRandomizedOrb} >
                        <Icon name='add' />
                        
                    </button>
                    
                    <Divider />
                    <div>
                        <label for="gravityDirection">Tilt</label>
                        <select name="gravityDirection" id="gravityDirection" onChange={this.changeGravityDirection}>

                            <option value="None">None</option>
                            <option value="Up">Up</option>
                            <option value="Down">Down</option>
                            <option value="Left">Left</option>
                            <option value="Right">Right</option>

                        </select>
                    </div>

                    
                    <div>
                        <label for="hueRange">Hue</label>
                        <input type="range" min="0" max="360" id="hueRange" onInput={this.changeHue}></input>
                    </div>
                    <div>
                        <label for="xLightRange">X-Light</label>
                        <input type="range" min="0" max={this.canvasWidth} id="xLightRange" onInput={this.xChangeLightPosition}></input>
                    </div>
                    <div>
                        <label for="yLightRange">Y-Light</label>
                        <input type="range" min="0" max={this.canvasHeight} id="yLightRange" onInput={this.yChangeLightPosition}></input>
                    </div>
                    <div>
                        <label for="bgShades">Background Shades #</label>
                        <input type="range" min="2" defaultValue="5" max={50} id="bgShades" onInput={this.changeBackgroundShades}></input>
                    </div>

                    
                    
                    
                    
                    
                    
                    
                </Container>
                
            </Layout>
        );

    }

}



export default Game;