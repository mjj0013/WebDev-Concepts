
import "../utility.js"
import { getRandomInt } from '../utility.js';

import GameObject from './GameObject';
class PhysicalObject extends GameObject {
    constructor(parent, context, obj_type, x ,y,width, height, xVelocity, yVelocity ,mass,color=null) {
        super(parent,context, x ,y, xVelocity, yVelocity ,mass);
        this.parent = parent;
        this.radius = width;
        this.obj_type = obj_type;

        this.width = width;
        this.height = height;
        this.coeff_of_rest = 0.1    //aluminum

        this.isColliding = false;
        this.collidable = true;
        this.collidingObjects = [];
        if(color==null) {this.hue = getRandomInt(0,360); }
        else {this.hue=color;}
        
        this.movable = true;
        this.controllable = false;

        this.shape = null;

        this.movable = true;
        this.controllable = true;

        this.collisionIter = 0;
        this.collisionIterSpeed =5;
        this.startCollisionIter = false;
        this.circle2circle = this.circle2circle.bind(this);
        this.circle2rectangle = this.circle2rectangle.bind(this);
        if(obj_type.includes("ellipse")) {this.shape = "ellipse";}
        if(obj_type.includes("rectangle")) {this.shape = "rectangle";}
        if(obj_type.includes("stationary")) {
            this.movable = false;
        }


        if(obj_type.includes("user") ){
            
            this.movable = true;
            this.controllable = true;
        }
    }
    circle2rectangle(circle,rectangle, isCollisionTest=false) {
        let testTop =  circle.y + circle.height < rectangle.x;
        let testBottom = circle.y - circle.height > rectangle.y;
        let testRight = circle.x - circle.width > rectangle.x;
        let testLeft = circle.x + circle.width < rectangle.x;
       
        let rectX = rectangle.x;
        let rectY = rectangle.y;
        if(testTop) {
            rectX = 
        }
        else if(testBottom) {

        }
        else if(testRight) {

        }
        else if(testLeft) {

        }


        let squaredDist = (circle.x-rectangle.x)*(circle.x-rectangle.x) + (circle.y-rectangle.y)*(circle.y-rectangle.y);
        if(squaredDist <= (circle1.radius+circle2.radius)*(circle1.radius+circle2.radius)) {

        }
    }
    circle2circle(circle1,circle2,isCollisionTest=false) {
        //http://www.jeffreythompson.org/collision-detection/table_of_contents.php
        //This example is built on code by Matt Worden
        let squaredDist = (circle2.x-circle1.x)*(circle2.x-circle1.x) + (circle2.y-circle1.y)*(circle2.y-circle1.y);
        if(squaredDist <= (circle1.radius+circle2.radius)*(circle1.radius+circle2.radius)) {
            if(isCollisionTest) {return true;}

            circle1.isColliding = true;
            circle2.isColliding = true;
            let vCollision = {x: circle2.x - circle1.x , y: circle2.y - circle1.y}
            let dist = Math.sqrt(squaredDist);

            let vCollisionNorm = {x: vCollision.x / dist, y: vCollision.y/dist};

           
            let vRelativeVelocity = {x: circle1.xVelocity-circle2.xVelocity, y: circle1.yVelocity-circle2.yVelocity};
            let speed = (vRelativeVelocity.x * vCollisionNorm.x) + (vRelativeVelocity.y * vCollisionNorm.y);    //equal to the dot product
            //speed *= Math.min(circle1.coeff_of_rest,circle2.coeff_of_rest);

            if(speed < 0) {return false;}

            let impulse  = 2*speed/(circle1.mass + circle2.mass);
            if(circle1.movable) {
                circle1.startCollisionIter = true;
                circle1.xVelocity -= (impulse*circle2.mass*vCollisionNorm.x);
                circle1.yVelocity -= (impulse*circle2.mass*vCollisionNorm.y);
            }
            if(circle2.movable) {
                circle2.startCollisionIter = true;
                circle2.xVelocity += (impulse*circle1.mass*vCollisionNorm.x);
                circle2.yVelocity += (impulse*circle1.mass*vCollisionNorm.y);
            }
            return true;
        }
        return false; 
    }

    draw() {
        if(this.shape == "rectangle") {
            
            this.parent.contextRef.current.fillStyle = 'hsl('+(this.hue)+',50%,50%)';
                        
            this.parent.contextRef.current.fillRect(this.x, this.y, this.width, this.height);
            this.parent.contextRef.current.stroke();

        }
        else if(this.shape == "ellipse") {
            this.parent.contextRef.current.beginPath();

            this.parent.contextRef.current.arc(this.x, this.y, this.width, 0, 2 * Math.PI);
           
            var theta = Math.atan((this.parent.yLightSource-this.y)/(this.parent.xLightSource-this.x));
            
            

            var gradient = this.parent.contextRef.current.createRadialGradient(this.x,this.y,this.radius,  
                (this.radius)*Math.cos(theta),
                (this.radius)*Math.sin(theta),
                (this.radius)
                );


                
                
            var num_stops = 10;
            var d_offset = this.radius/this.parent.rLightSource;
            for(var i=1; i < num_stops+1; ++i) {
                var percent = Math.min(d_offset*i/num_stops, 1.0);
                gradient.addColorStop(percent, 
                    'hsl('
                        +(this.hue)+','
                        +this.parent.backgroundSaturation*(1.0-percent)+'%,'
                        +(this.parent.backgroundLightness*(percent))+'%)'
                    
                    )
            }
            
            this.parent.contextRef.current.fillStyle = gradient;
            this.parent.contextRef.current.fill();
            this.parent.contextRef.current.stroke();

        }
        
       
        
    }

    update() {
        
        this.parent.physicalObjects.forEach((obj,index) => {
            if(obj != this) {   
                if(this.shape == "ellipse" && obj.shape=="ellipse") {
                    this.circle2circle(this,obj);
                }  
            }
        })
        let new_xVelocity = (this.xVelocity+this.parent.xGlobalForce)*.98;
        let new_yVelocity = (this.yVelocity+this.parent.yGlobalForce)*.98;



        //For Boundary Collisions
        if(this.x-this.width + new_xVelocity<=0) {                     //left
            if(this.parent.xGlobalForce ==0.0) {
                new_xVelocity = -1*new_xVelocity;
            }
            else {
                new_xVelocity = 0.0;

            }
            //this.parent.backgroundEffects.push(new BackgroundEffect(this.parent, this.context, this.x,this.y,10,10,30,"left"));


        }
        if(this.x + new_xVelocity >= this.parent.canvasWidth-this.width) {    //right
            if(this.parent.xGlobalForce ==0.0) {
                new_xVelocity = -1*new_xVelocity;
            }
            else {
                new_xVelocity = 0.0;
            }
            
            //this.parent.backgroundEffects.push(new BackgroundEffect(this.parent, this.context, this.x,this.y,10,10,30,"right"));



        }
        if(this.y + new_yVelocity >= this.parent.canvasHeight-this.height) {    //bottom
            if(this.parent.yGlobalForce ==0.0) {
                new_yVelocity = -1*new_yVelocity;
            }
            else {
                new_yVelocity = 0.0;
            }
            
            //this.parent.backgroundEffects.push(new BackgroundEffect(this.parent, this.context, this.x,this.y,10,10,30,"bottom"));


        }
        if(this.y - this.height+ new_yVelocity <= 0) {                  //top
            if(this.parent.yGlobalForce==0.0) {
                new_yVelocity = -1*new_yVelocity;
            }
            else {
                new_yVelocity = 0.0;
            }
            
            //this.parent.backgroundEffects.push(new BackgroundEffect(this.parent, this.context, this.x,this.y,10,10,30,"top"));
        }


        this.x = Math.max(Math.min(this.x + new_xVelocity, this.parent.canvasWidth-this.width),0);
        this.y = Math.max(Math.min(this.y + new_yVelocity, this.parent.canvasHeight-this.height),0);
        
        this.xVelocity = new_xVelocity;
        this.yVelocity = new_yVelocity;
      
    
    }
    
};
export default PhysicalObject;