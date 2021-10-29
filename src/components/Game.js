import React, {useRef} from 'react';

import {Table, Header, Container, Divider, Icon, ItemContent } from 'semantic-ui-react';

import Layout from '../Layout';
import "regenerator-runtime/runtime";

import BackgroundEffect from './BackgroundEffect';
import PhysicalObject from './PhysicalObject';
//import ObjTable from './ObjTable.js';
import "../utility.js"
import { getRandomInt, crossProduct } from '../utility.js';
class Game extends React.Component {
    
    constructor(props) {
        super(props);
        this.svgRef = React.createRef();

        this.canvasRef = React.createRef();
        this.contextRef = React.createRef();
        this.draw = this.draw.bind(this);
        this.update = this.update.bind(this);
        this.initWorld = this.initWorld.bind(this);

        this.moveObj = this.moveObj.bind(this);
 
        this.addPhysicalObject = this.addPhysicalObject.bind(this);

        this.renderTable = this.renderTable.bind(this);
        this.mouseClickHandler = this.mouseClickHandler.bind(this);
        this.saveStates = this.saveStates.bind(this);
        this.loadExistingItems = this.loadExistingItems.bind();
        this.changeHue = this.changeHue.bind(this);

        this.convertToBitmap = this.convertToBitmap.bind(this)

        this.collidesWith = this.collidesWith.bind(this);
       
        this.getTransformedPt = this.getTransformedPt.bind(this);

        // this.dragDisplacement = {x:0, y:0}


        this.zoomFocusPt = {x:0, y:0};

        this.panSVG = this.panSVG.bind(this);
      

        this.dragStart = null;
   
        

        this.numOfBackgroundShades = 5;
        this.changeGravityDirection = this.changeGravityDirection.bind(this);
        this.physicalObjects = [];
        this.controlledObjectIndex = -1;
        this.physicalObjectMap = [];

        this.insertRandomizedOrb= this.insertRandomizedOrb.bind(this);


        this.canvasWidth = 3000;
        this.canvasHeight = 2000;


        this.backgroundHue = 180;
        this.backgroundSaturation = 80;
        this.backgroundLightness = 95;


        this.userExertion = 5;      //was 10
        this.grid_length = 75;

        this.fromLocation = null;

        this.lastZoom = {x:this.canvasWidth/2, y:this.canvasHeight/2};

        this.transformMatrix = [1, 0, 0, 1, 0, 0];
        

        this.xGlobalForce = 0.0;
        this.yGlobalForce = 0.0;

        this.closeDragElement = this.closeDragElement.bind(this);
        this.elementDrag = this.elementDrag.bind(this);
        this.dragMouseDown = this.dragMouseDown.bind(this);
        this.makeDraggable = this.makeDraggable.bind(this);
        this.currentlyDragging=null;
        
        
        this.updateZoom = this.updateZoom.bind(this);
        this.captureZoomEvent = this.captureZoomEvent.bind(this)
        this.zoomIntensity = 0.2;
        this.zoomHasHappened = 0;
        this.contextCurrentOrigin = {x:0,y:0}
        this.zoomPos = {x:0, y:0}
        this.canvasScale = 1;

        this.generateRandomMesh = this.generateRandomMesh.bind(this);

        this.isPointInPath = this.isPointInPath.bind(this);
        this.regionPts = [];
        this.regionSides = [];
        this.ptIdxToEdgeIdx = {}
    }


    

    convertToBitmap = () => {
        const url = URL.createObjectURL(new Blob([this.gameSVG], { type: 'image/svg+xml' }));
        console.log(url);


        
        svgImage.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = this.gameSVG.clientWidth;
            canvas.height = this.gameSVG.clientHeight;
            canvas.getContext('2d').drawImage(this.gameSVG,0,0);

            const imgData = canvas.toDataURL('image/png');
        }
        //createImageBitmap( new Image(this.gameSVG))
           

    }

    closeDragElement() {
        this.currentlyDragging = null;
        document.getElementById("gameSVG").style.cursor = 'grab';
        document.onmouseup = null;
        document.onmousemove = null;
    }

    elementDrag(e) {    
        if(!(e.target.id.substr(0,2)=='pt' || e.target.id=="gameSVGBackground")) return e;
        e = e || window.event;
        console.log("dragging " + e.target.id);
        // var gameSVG = document.getElementById('gameSVG');

        // if(this.currentlyDragging==null) this.currentlyDragging = e.target.id
        // else return e.preventDefault() && false;

        this.lastZoom.x = e.offsetX;
        this.lastZoom.y = e.offsetY;
       
        if(this.dragStart) {
            var pt = this.getTransformedPt(this.lastZoom.x, this.lastZoom.y);
            // this.dragDisplacement.x += (pt.x-this.dragStart.x)/4;
            // this.dragDisplacement.y += (pt.y-this.dragStart.y)/4;
            
            if(e.target.id=='gameSVGBackground') {
                this.panSVG((pt.x-this.dragStart.x)/4, (pt.y-this.dragStart.y)/4)
            }
            else if(e.target.id.substr(0,2)=='pt') {
                let ptIndex = parseInt(e.target.id.substr(2));
                console.log(ptIndex);
                this.regionPts[ptIndex].x = pt.x;
                this.regionPts[ptIndex].y = pt.y;
                let d =  `M ${this.regionPts[ptIndex].x},                               ${this.regionPts[ptIndex].y}`;
                    d += `L ${this.regionPts[this.ptData[ptIndex].connections[0]].x}, ${this.regionPts[this.ptData[ptIndex].connections[0]].y}`
                    d += `L ${this.regionPts[this.ptData[ptIndex].connections[1]].x}, ${this.regionPts[this.ptData[ptIndex].connections[1]].y}`
                    d += `L ${this.regionPts[ptIndex].x}, ${this.regionPts[ptIndex].y}`;

                e.target.setAttributeNS(null,'d', d);
                e.target.setAttributeNS(null,'cx', pt.x);
                e.target.setAttributeNS(null,'cy', pt.y);
            }
            
        }
        
      
        return e.preventDefault() && false;
    }

    dragMouseDown(e) {
        e = e || window.event;
        //e.preventDefault();
        console.log(e.target.id);

        if(this.currentlyDragging==null) this.currentlyDragging = e.target.id
        else return e.preventDefault() && false;
        if(e.target.id=="gameSVGBackground") {
            var gameSVG = document.getElementById("gameSVG");
            gameSVG.style.cursor = 'grabbing'
        }
        
        this.lastZoom.x = e.offsetX;
        this.lastZoom.y = e.offsetY;

        this.dragStart = this.getTransformedPt(this.lastZoom.x, this.lastZoom.y);
        
        // e.target.onmouseup = this.closeDragElement;
        // e.target.onmousemove= this.elementDrag;

        document.onmouseup = this.closeDragElement;
        document.onmousemove = this.elementDrag;


        return e.preventDefault() && false;
    }

    makeDraggable(item_id) {
        var item = document.getElementById(item_id)
        item.onmousedown = this.dragMouseDown;
    }



    changeHue = (event) => this.backgroundHue = event.target.value;
       
    
   

    

    
    initWorld = () =>{
        this.addPhysicalObject("user-ellipse", 50,50,25,25,0,0,25,'rgb(24,210,24)',true);
        this.addPhysicalObject("user-ellipse",150,50,25,25,0,0,25,'rgb(150,90,24)', true);
        this.addPhysicalObject("user-ellipse",50,150,25,25,0,0,25,'rgb(54,76,24)', true);
        this.addPhysicalObject("user-ellipse",400,150,25,25,0,0,25,'rgb(54,76,24)', true);
        this.addPhysicalObject("user-ellipse",500,150,25,25,0,0,25,'rgb(54,76,24)', true);
        //this.addPhysicalObject("world-rectangle-stationary",200,300,25,100,0,0,25,'rgb(54,76,24)',true);
        this.addPhysicalObject("user-ellipse",50,400,25,25,0,0,25,'rgb(54,76,24)', true);
        this.addPhysicalObject("user-ellipse",160,150,25,25,0,0,25,'rgb(54,76,24)', true);
        this.addPhysicalObject("user-ellipse",400,400,25,25,0,0,25,'rgb(54,76,24)',true );
        this.addPhysicalObject("user-ellipse",400,75,25,25,0,0,25,'rgb(54,76,24)',true);
        //this.addPhysicalObject("world-irregular-stationary", -1,-1,-1,-1,-1,-1,-1, 'rgb(54,76,24)',true);
        
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
        let newObj =  new PhysicalObject(this, this.contextRef.current, obj_type, "circle"+obj.index, x, y, width, height, dx,dy,mass,null);
        this.physicalObjects.push(newObj);
        if(isNew) {
            localStorage.physicalObjectMap = JSON.stringify(this.physicalObjectMap);
           
            //this.physicalObjects.push(newObj);
        }
        else {
            console.log("new length: "+ this.physicalObjects.length);
            console.log(this.controlledObjectIndex);
        }
        var svg_ns = "http://www.w3.org/2000/svg";
       
        let circleGroup = document.getElementById("circleGroup");
        let newShape = document.createElementNS(svg_ns,'circle');
        newShape.setAttributeNS(null,'id',"circle"+obj.index);
        newShape.setAttributeNS(null,'cx',newObj.x);
        newShape.setAttributeNS(null,'cy',newObj.y);
        newShape.setAttributeNS(null,'r',newObj.radius);
        newShape.setAttributeNS(null,'fill', newObj.color);

        newShape.addEventListener('click', (e) => {
            console.log("clicked obj: "+obj.index)
            this.physicalObjects[this.controlledObjectIndex].isSelected = false;
            this.physicalObjects[obj.index].isSelected = true;
            this.controlledObjectIndex = obj.index;

        })
        console.log(this.physicalObjects.length);
        circleGroup.appendChild(newShape);

    }

    captureZoomEvent = (e) => {
        // var gameSVG = document.getElementById("gameSVG");
        this.lastZoom.x = e.offsetX;
        this.lastZoom.y = e.offsetY;
        let delta = e.wheelDelta/1000;
       
        if(delta) this.updateZoom(delta);

        this.zoomHasHappened = 1;
        //this.zoomDeltaY = e.deltaY
        return e.preventDefault() && false;
    }
    updateZoom = (delta) => {

        let wheelNorm = delta;
        let zoomVar = Math.pow(this.zoomIntensity,wheelNorm);
        // this.zoomFocusPt = this.getTransformedPt(this.lastZoom.x, this.lastZoom.y);
        for(var i =0; i < 6; ++i) this.transformMatrix[i] *=(zoomVar)
        
        this.transformMatrix[4] += (1-zoomVar)*(this.lastZoom.x);
        this.transformMatrix[5] += (1-zoomVar)*(this.lastZoom.y);

        document.getElementById('circleGroup').setAttributeNS(null, "transform", `matrix(${this.transformMatrix.join(' ')})`);
        document.getElementById('regionGroup').setAttributeNS(null, "transform", `matrix(${this.transformMatrix.join(' ')})`);
        this.zoomHasHappened = 0;
        
    }
    getTransformedPt(x,y) {
        var focalPt = new DOMPoint();
        focalPt.x = x;
        focalPt.y = y;
        var matrix = new DOMMatrix(this.transformMatrix)
        return focalPt.matrixTransform(matrix.inverse());
    }

    panSVG(dx,dy) {
        this.transformMatrix[4] += dx;
        this.transformMatrix[5] += dy;
        document.getElementById('circleGroup').setAttributeNS(null, "transform", `matrix(${this.transformMatrix.join(' ')})`);
        document.getElementById('regionGroup').setAttributeNS(null, "transform", `matrix(${this.transformMatrix.join(' ')})`);
    }
   
    moveObj = (key) => {
        let obj = this.physicalObjects[this.controlledObjectIndex];
        if(key=='ArrowDown') {obj.yVelocity = obj.yVelocity+this.userExertion;}
        else if(key=='ArrowUp') {obj.yVelocity = obj.yVelocity-this.userExertion;}
        else if(key=='ArrowLeft') {obj.xVelocity = obj.xVelocity-this.userExertion;}
        else if(key=='ArrowRight') {obj.xVelocity = obj.xVelocity+this.userExertion;}
        else if(key=='KeyR') {
            obj.angularAccel = 60;
            obj.rotating = true;
        }

    }

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
        //this.contextRef.current = this.canvasRef.current.getContext('2d');
        setInterval(
            () => {
                this.update();
                this.draw();
        }, 1000/60);
        

    }
    componentDidMount = () => {
        //document.getElementById("gameCanvas").addEventListener("wheel",this.captureZoomEvent);
        var gameSVG = document.getElementById("gameSVG")
        gameSVG.addEventListener("wheel",this.captureZoomEvent,false);
        gameSVG.addEventListener("DOMMouseScroll", this.captureZoomEvent,false);

        console.log('svgw', gameSVG.clientWidth)
        //this.makeDraggable('gameCanvas');
        this.makeDraggable('gameSVG');
        setInterval(
            () => {
            this.update();
            this.draw();
        }
        , 1000/60);
        //this.canvasRef.current.addEventListener('mousedown', (e) => {this.mouseClickHandler(this.canvasRef.current,e)});

        if(localStorage.first==null) {
            console.log("loading for first time");
            localStorage.first ='1';         //the first time loading
            this.initWorld();
            this.fromLocation = "/game";
        }

        this.unlisten = this.props.history.listen((location, action) => {
            console.log(window.location.pathname);

            if(localStorage.first != null) {     //not the first time loading (items already saved)
                if(this.fromLocation =="/game")  this.saveStates();
                   
                if(window.location.pathname == "/game") {
                    this.loadExistingItems();
                    this.fromLocation = "/game";
                }
                this.fromLocation = window.location.pathname; 
            }   
          });

        window.addEventListener("keydown", 
            (e) =>{
                if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
                    e.preventDefault();
                }
                if(e.code=='Space') {this.generateRandomMesh(5);}
                this.moveObj(e.code);
            }
        );
    }
    
    update = () =>{  
        //if(this.canvasRef.current!=null) {this.contextRef.current = this.canvasRef.current.getContext('2d');}
        this.physicalObjects.forEach((obj,index) => {
            obj.update();
            this.physicalObjectMap[index].x = obj.x;
            this.physicalObjectMap[index].y = obj.y;
            this.physicalObjectMap[index].dx = obj.xVelocity;
            this.physicalObjectMap[index].dy = obj.yVelocity;
        })
    }

    draw = () => {
        //this.contextRef.current.fillStyle = "black";
       
        //this.contextRef.current.fillRect(0, 0, this.contextRef.current.width,   this.contextRef.current.height); 
        for(let i=0; i<this.physicalObjects.length;++i) {
            this.physicalObjects[i].draw();
        }
        
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
        let onObject = false;
        this.physicalObjectMap.forEach((item,index) => {
            var item = this.physicalObjects[index];
            if(item.controllable==true) {
                if(item.shape == 'ellipse') {
                    if((x >= item.x-item.radius) && (x <= item.x+item.radius)) {
                        if((y >= item.y-item.radius) && (y <= item.y+item.radius)) {
                            onObject=true;
                            this.controlledObjectIndex = index;
                        }
                    }
                }
                else if(item.shape == 'rectangle') {
                    if((x >= item.x) && (x <= item.x+item.width)) {
                        if((y >= item.y) && (y <= item.y+item.height)) {
                            onObject = true;
                            this.controlledObjectIndex = index;
                        }
                    }
                }  
            }
        })
        if(!onObject) { this.dragMouseDown(e); }
        
        console.log("x: " + x + " y: " + y)
        
    }

    collidesWith = (circleObj1,circleObj2) => {
        let squaredDist = (circleObj2.x-circleObj1.x)*(circleObj2.x-circleObj1.x) + (circleObj2.y-circleObj1.y)*(circleObj2.y-circleObj1.y);
        if(squaredDist <= (circleObj1.radius+circleObj2.radius)*(circleObj1.radius+circleObj2.radius)) return true;
        else return false;
    }

    insertRandomizedOrb = () =>{
        let mass = getRandomInt(5,200);
        let foundSpot = false;
        let x,y,radius;
        let maxMassReducer = 5;
        let num_of_failures = 0;
        while(foundSpot==false) {
            if(num_of_failures > 50) {console.log("Too many attempts. Try again."); return;}
        
            radius = getRandomInt(5,75-Math.max(maxMassReducer*num_of_failures, 25));
            x = getRandomInt(radius,this.canvasWidth-radius);
            y = getRandomInt(radius,this.canvasHeight-radius);
            
            for(var i=0; i < this.physicalObjects; ++i) {
                let tempObj = {x:x, y:y, radius:radius};
                //tempObj = this.physicalObjects[i];
                let collides = this.collidesWith(this.physicalObjects[i], tempObj)
                //let collides = this.physicalObjects[i].circle2circle(this.physicalObjects[i], tempObj,true);
                if(collides) {
                    ++num_of_failures;
                    break;
                }
            }

            foundSpot = true;
        }  
        if(foundSpot) this.addPhysicalObject("user-ellipse",x,y,radius,radius,0,0,mass,null,true);
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
    generateRandomMesh = (numPts) => {
        var polygons = [];  //just triangles for now
        var lines = [];
        this.ptData = [];    //each index is the index of the pt
        for(let i=0; i < numPts;++i) {
            let ptExists = true;
            let x,y;
            while(ptExists) {
                x = getRandomInt(0, 800);
                y = getRandomInt(0, 600);
                ptExists = this.regionPts.includes({x:x, y:y});
            }

            this.regionPts.push({x:x, y:y});
        }
        
        for(let i=0; i < this.regionPts.length; ++i) {
            let thisPt = this.regionPts[i];
            let closestPts = [];

            for(let j=0; j < this.regionPts.length; ++j){
                if(j==i) continue;
                let otherPt =  this.regionPts[j];

                let squaredDist = (thisPt.x-otherPt.x)*(thisPt.x-otherPt.x) + (thisPt.y-otherPt.y)*(thisPt.y-otherPt.y);
                closestPts.push({index:j,squaredDist:squaredDist});
            }
            closestPts.sort(function(a,b) { return a.squaredDist - b.squaredDist;  })
            this.ptData.push({index:i, closestPts:closestPts, connections:[]});
               
        }

        for(let a=0; a < this.ptData.length; ++a) {
            //  this.ptData[a].closestPts[0] ===> closest point
            //  this.ptData[a].closestPts[numPts-1] ==> farthest point
            let b=0;
            let cycle_n=1;
            while(this.ptData[a].connections.length<2) {
                if(a==b) {
                    b = (b+1)%this.ptData[a].closestPts.length;
                    continue;
                }

                let pt = this.ptData[this.ptData[a].closestPts[b].index];
                if(cycle_n==1 && pt.connections.length<2) {
                    pt.connections.push(a);
                    this.ptData[a].connections.push(b);
                    lines.push([a,b]);
                    // if(lines.find(l=>l[0]==b && l[1]==a)==undefined) {
                    //     lines.push([a,b]);
                    // }

                    
                }
                else if(cycle_n>1) {
                    pt.connections.push(a);
                    this.ptData[a].connections.push(b);
                    lines.push([a,b]);
                    // if(lines.find(l=>l[0]==b && l[1]==a)==undefined) {
                    //     lines.push([a,b]);
                    // }
                }
                if( (b)%this.ptData[a].closestPts.length == 0 ) ++cycle_n;
                b = (b+1)%this.ptData[a].closestPts.length;
            }
        }
        console.log('lines', lines);
        var svg_ns = "http://www.w3.org/2000/svg";
        
        for(let p=0; p < this.regionPts.length;++p) {
            
            let d = `M ${this.regionPts[p].x}, ${this.regionPts[p].y}`;
                d += `L ${this.regionPts[this.ptData[p].connections[0]].x}, ${this.regionPts[this.ptData[p].connections[0]].y}`
                d += `L ${this.regionPts[this.ptData[p].connections[1]].x}, ${this.regionPts[this.ptData[p].connections[1]].y}`
                d += `L ${this.regionPts[p].x}, ${this.regionPts[p].y}`;


            let regionGroup = document.getElementById("regionGroup");
            let newPath = document.createElementNS(svg_ns,'path');
            newPath.setAttributeNS(null,'id',"path"+p);
            newPath.setAttributeNS(null,'d',d);
            newPath.setAttributeNS(null,'fill','transparent');
            //newPath.setAttributeNS(null,'shape-rendering', 'crispEdges')
            //newPath.setAttributeNS(null,'stroke-width', 5);
           
            newPath.setAttributeNS(null,'stroke', 'black');
            regionGroup.appendChild(newPath);

            let newPt = document.createElementNS(svg_ns,'circle');
            newPt.setAttributeNS(null,'id','pt'+p);
            newPt.setAttributeNS(null,'cx', this.regionPts[p].x);
            newPt.setAttributeNS(null,'cy', this.regionPts[p].y);
            newPt.setAttributeNS(null,'r', 5);
            newPt.setAttributeNS(null,'fill', 'black');
            newPt.addEventListener('click',this.dragMouseDown);
           

            //newPt.setAttributeNS(null,'text',`${p}`)
            //newLabel.appendChild(document.createTextNode(`${p}`));
            //<text x="50%" y="50%" text-anchor="middle" stroke="#51c5cf" stroke-width="2px" dy=".3em">Look, I’m centered!Look, I’m centered!</text>
            
            regionGroup.appendChild(newPt);
            //regionGroup.appendChild(newLabel);

        }


    }
    isPointInPath(pt, polygon) {
        var num = polygon.length;
        let j = num - 1;
        let result = false;
        for(let i =0; i < num; ++i) {
            if((pt.x == polygon[i].x) && (pt.y==polygon[i].y)) return true;
            
            if((polygon[i].y > pt.y) != (polygon[j].y > pt.y) ) {
                let slope = (pt.x-polygon[i].x)*(polygon[j].y-polygon[i].y) - (polygon[j].x-polygon[i].x)*(pt.y-polygon[i].y);
                if(slope==0) return true;
                if((slope < 0) != (polygon[j].y < polygon[i].y)) result=!result;
            }
            j=i;


        }
        return result;
    }
    
    

    // <Container id="viewAndHeader">
    //     <canvas id="gameCanvas"  ref={this.canvasRef} width={this.canvasWidth} height={this.canvasHeight} className="gameCanvas"></canvas>
    // </Container>
    //<path d="M140 20C73 20 20 74 20 140c0 135 137 170 228 303 88-132 229-173 229-303 0-66-54-120-120-120-48 0-90 28-109 69-19-41-60-69-108-69z" stroke="black" fill="transparent" />
    // <path d="M 10 10 C 20 20, 40 20, 50 10" stroke="black" fill="transparent"/>
                    
    // <polyline points="60, 110 65, 120 70, 115 75, 130 80, 125 85, 140 90, 135 95, 150 100, 145"/>
    // <path fill="red" stroke="red" d="
    //                         M 500,800
    //                         C 30,90  559,100  40,20 
    //                         L 45, 25
    //                         C 40,20  90,35  700,70 
    //                         C 400,200  100,100  500,800 
    //                         "
    //                     />
    render = () =>{

        return (
            <Layout title="Game Page" description="A description about the game">
                <Container>
                    <Header as="h3">Another header</Header>
                </Container>
                <svg id="gameSVG" viewBox='0 0 3000 2000' ref={this.svgRef} width={this.canvasWidth} height={this.canvasHeight} xmlns="http://www.w3.org/2000/svg"> 
                    <rect id="gameSVGBackground" width="100%" height="100%" fill='grey' />
                    <g id="regionGroup" transform="matrix(1 0 0 1 0 0)">
                        
                    </g>
                    <g id="circleGroup" transform="matrix(1 0 0 1 0 0)" />
                </svg>

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
                </Container>      
            </Layout>
        );
    }
}



export default Game;