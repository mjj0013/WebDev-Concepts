
import { det,getRandomInt } from "../utility.js";

export class Mesh {
    constructor(parent, pts=null) {
        this.parent = parent;
        if(pts==null) this.pts=[];
        else this.pts = pts;
        this.ptData = [];
        this.edges = []
        this.polygons = [];

        this.hasIntersection2D = this.hasIntersection2D.bind(this);
        this.evalNewEdge = this.evalNewEdge.bind(this);
        this.edgeExists = this.edgeExists.bind(this);
        this.handleStragglers = this.handleStragglers.bind(this);

        this.depthFirstSearch = this.depthFirstSearch.bind(this);
        this.DFS = this.DFS.bind(this);
        this.visitedDFS = [];
        this.cyclesDFS = [];
        this.update = this.update.bind(this);
        
        this.generateEdges = this.generateEdges.bind(this);
        this.build = this.build.bind(this);

        //this.ptAnimations = [5,5,5,5,5,5,3,3,3,3,3,3,3,3,3,3];


        this.animateMesh = false;
        
       
    }

    build(numPts, random=false) {
        if(!random) {
            for(let i=0; i < numPts;++i) {
                let isNewPt = false;
                let x,y;
                while(!isNewPt) {  
                    let ptExists = false;
                    x = getRandomInt(0, this.parent.canvasWidth);
                    y = getRandomInt(0, this.parent.canvasHeight);
                    for(let i=0; i < this.pts.length;++i) {
                        if(this.pts[i].x==x && this.pts[i].y==y) {
                            ptExists = true;
                            break;
                        }
                    }
                    if(!ptExists) isNewPt = true;
                }
            
                this.pts.push({x:x, y:y});
                //this.regionPts.push({x:x, y:y});
            }
            //find closest points for each point
            for(let i=0; i < this.pts.length; ++i) {
                let thisPt = this.pts[i];
                let closestPts = [];
                for(let j=0; j < this.pts.length; ++j){
                    if(j==i) continue;
                    let otherPt =  this.pts[j];
                    let squaredDist = (thisPt.x-otherPt.x)*(thisPt.x-otherPt.x) + (thisPt.y-otherPt.y)*(thisPt.y-otherPt.y);
                    closestPts.push({index:j,squaredDist:squaredDist});
                }
                closestPts.sort(function(a,b) { return a.squaredDist - b.squaredDist;  })
                this.ptData.push({index:i, closestPts:closestPts, connections:[], edgeIDs:[]});
            }
        }
        
    }

    generateEdges() {
        for(let a=0; a < this.pts.length; ++a) {
            //  closestPts[0] ===> closest point
            //  closestPts[numPts-1] ==> farthest point
            
            //first try this: find set-intersections of the top 5 closest points to point A
            let aTop5 = this.ptData[a].closestPts.map(x=>{return x.index;}).slice(0,4);
            let bTop5 = this.ptData[aTop5[0]].closestPts.map(x=>{return x.index;}).slice(0,4);
            let cTop5 = this.ptData[aTop5[1]].closestPts.map(x=>{return x.index;}).slice(0,4);
            let dTop5 = this.ptData[aTop5[2]].closestPts.map(x=>{return x.index;}).slice(0,4);
         
            let commonTopPts = aTop5.concat(bTop5,cTop5,dTop5);
            commonTopPts = commonTopPts.filter(p => aTop5.includes(p));
            commonTopPts = commonTopPts.filter(p => bTop5.includes(p));
            commonTopPts = commonTopPts.filter(p => cTop5.includes(p));
            commonTopPts = commonTopPts.filter(p => dTop5.includes(p));
            commonTopPts = commonTopPts.concat(aTop5);
            
            for(let p=0; p < commonTopPts.length; ++p) {
                for(let p2=0; p2 < commonTopPts.length; ++p2) {
                    if(p==p2) continue;
                    if(commonTopPts[p]==commonTopPts[p2]) continue;
            
                    if(!this.edgeExists(commonTopPts[p],commonTopPts[p2])) {
                        if(this.evalNewEdge([this.pts[commonTopPts[p]],  this.pts[commonTopPts[p2]]])) {
                            
                            this.ptData[commonTopPts[p2]].connections.push(commonTopPts[p]);                 //add node a to node b's connections 
                            this.ptData[commonTopPts[p]].connections.push(commonTopPts[p2]);   //add node b to node a's connections 
                            
                            this.edges.push({id:`edge${commonTopPts[p]}_${commonTopPts[p2]}`, data:[commonTopPts[p],commonTopPts[p2]]});    //add new edge to edges
                           
                            //makes it possible to adjust associated edges whenever a vertex is dragged
                            if(!this.ptData[commonTopPts[p]].edgeIDs.includes(`edge${commonTopPts[p]}_${commonTopPts[p2]}`) && !this.ptData[commonTopPts[p]].edgeIDs.includes(`edge${commonTopPts[p2]}_${commonTopPts[p]}`)) {
                                this.ptData[commonTopPts[p]].edgeIDs.push(`edge${commonTopPts[p]}_${commonTopPts[p2]}`);
                            }
                            if(!this.ptData[commonTopPts[p2]].edgeIDs.includes(`edge${commonTopPts[p]}_${commonTopPts[p2]}`) && !this.ptData[commonTopPts[p2]].edgeIDs.includes(`edge${commonTopPts[p2]}_${commonTopPts[p]}`)) {
                                this.ptData[commonTopPts[p2]].edgeIDs.push(`edge${commonTopPts[p]}_${commonTopPts[p2]}`);
                            }               
                        }
                    }
                }
            }
        }
        //handle stragglers
        this.handleStragglers();
    }
    


    update() {
        if(this.animateMesh) {
            for(let ptIndex=0; ptIndex < this.pts.length; ++ptIndex) {
                if(getRandomInt(0,2)==1) {
                    this.pts[ptIndex].x += getRandomInt(-8,8)*Math.exp(1/5);
                    this.pts[ptIndex].y += getRandomInt(-8,8)*Math.exp(1/5);
                    document.getElementById("pt"+ptIndex).setAttribute("cx", this.pts[ptIndex].x);
                    document.getElementById("pt"+ptIndex).setAttribute("cy", this.pts[ptIndex].y);
                }
                for(let edge=0; edge < this.ptData[ptIndex].edgeIDs.length;++edge) {
                    let assocEdge = this.ptData[ptIndex].edgeIDs[edge];
                    let ptIds = assocEdge.replace('edge','').split('_');
                    let ptA = parseInt(ptIds[0]);
                    let ptB = parseInt(ptIds[1]);
                    var d=``
                    if(ptIds[1]== ptIndex) {
                        //the vertex being dragged is 'Y' in the 'edgeX_Y' naming convention, so change of coordinates that one  only
                        d = `M ${this.pts[ptA].x},${this.pts[ptA].y}`
                        d += `L ${this.pts[ptB].x},${this.pts[ptB].y}`
                    }
                    else {
                        //the vertex being dragged is 'X' in the 'edgeX_Y' naming convention, so change  coordinates of that one only
                        d = `M ${this.pts[ptA].x},${this.pts[ptA].y}`
                        d += `L ${this.pts[ptB].x},${this.pts[ptB].y}`
                    }
                    document.getElementById(assocEdge).setAttribute('d',d);
                }
            }

           
        }
        
    }


    evalNewEdge(newEdge) {
        let successful = true;
        for(let e=0; e < this.edges.length;++e) {
            let currentEdge = [this.pts[this.edges[e].data[0]], this.pts[this.edges[e].data[1]]];
            if(this.hasIntersection2D(currentEdge,newEdge)) {
                successful = false;
                
            }
            
        }
        return successful;
    }
    edgeExists(ptA,ptB) {
        return !(this.edges.find(l=>l.data[0]==ptB && l.data[1]==ptA)==undefined) && (this.edges.find(l=>l.data[0]==ptA && l.data[1]==ptB)==undefined);
    }

    //try this one vvvvvvvv
    hasIntersection2D(segment1,segment2) {
        let x1 = segment1[0].x;
        let y1 = segment1[0].y;
        let x2 = segment1[1].x;
        let y2 = segment1[1].y;

        let x3 = segment2[0].x;
        let y3 = segment2[0].y;
        let x4 = segment2[1].x;
        let y4 = segment2[1].y;

        let upperLeft = det(x1,y1,x2,y2)
        let lowerLeft = det(x3,y3,x4,y4)

        let denominator = det(x1-x2, y1-y2, x3-x4, y3-y4);

        let xNumerator = det(upperLeft, x1-x2, lowerLeft, x3-x4);
        let yNumerator = det(upperLeft, y1-y2, lowerLeft, y3-y4);


        let xCoord = xNumerator/denominator;
        let yCoord = yNumerator/denominator;

        
        if((xCoord==segment1[0].x && yCoord==segment1[0].y) || 
            (xCoord==segment1[1].x && yCoord==segment1[1].y) ||
            (xCoord==segment2[0].x && yCoord==segment2[0].y) ||
            (xCoord==segment2[1].x && yCoord==segment2[1].y)
            
            ) {return false;}
   
        
        let onSegment1X = Math.min(segment1[0].x,segment1[1].x) <= xCoord &&  xCoord <= Math.max(segment1[0].x,segment1[1].x);
        let onSegment1Y = Math.min(segment1[0].y,segment1[1].y) <= yCoord <= Math.max(segment1[0].y,segment1[1].y);
        let onSegment1 = onSegment1X && onSegment1Y;

        let onSegment2X = Math.min(segment2[0].x,segment2[1].x) <= xCoord &&  xCoord <= Math.max(segment2[0].x,segment2[1].x);
        let onSegment2Y = Math.min(segment2[0].y,segment2[1].y) <= yCoord <= Math.max(segment2[0].y,segment2[1].y);
        let onSegment2 = onSegment2X && onSegment2Y;
        return onSegment1 && onSegment2;

    }


    handleStragglers() {
        
        let numStragglers = this.ptData.length;
        while(numStragglers != 0) {
            
            for(let p=0; p < this.ptData.length;++p) {
                if(this.ptData[p].connections.length >= 2) --numStragglers

                else if(this.ptData[p].connections.length == 1) {
                    for(let p2=0; p2 < this.ptData[p].closestPts.length;++p2) {
                        let nextClosestPt = this.ptData[p].closestPts[p2];
                        if(this.ptData[p].connections.includes(nextClosestPt.index)) continue;     //if its only connection is this point, skip
                        if(!this.edgeExists(p,nextClosestPt.index)) {       
                            
                            if(this.evalNewEdge([this.pts[p],  this.pts[nextClosestPt.index]])) {
                                let nextClosestPtObj = this.ptData[nextClosestPt.index];
                            
                                nextClosestPtObj.connections.push(p);                 //add node a to node b's connections 
                                this.ptData[p].connections.push(nextClosestPt.index);   //add node b to node a's connections 
                                this.edges.push({id:`edge${p}_${nextClosestPt.index}`, data:[p,nextClosestPt.index]});    //add new edge to edges
        
                                //makes it possible to adjust associated edges whenever a vertex is dragged
                                if(!this.ptData[p].edgeIDs.includes(`edge${p}_${nextClosestPt.index}`) && !this.ptData[p].edgeIDs.includes(`edge${nextClosestPt.index}_${p}`)) this.ptData[p].edgeIDs.push(`edge${p}_${nextClosestPt.index}`);
                                if(!this.ptData[p2].edgeIDs.includes(`edge${p}_${nextClosestPt.index}`) && !this.ptData[p2].edgeIDs.includes(`edge${nextClosestPt.index}_${p}`)) this.ptData[p2].edgeIDs.push(`edge${p}_${nextClosestPt.index}`);
                            }
                        }
                    }
                    //if(this.ptData[p].connections.length >= 2) {console.log("worked"); --numStragglers;}
                    --numStragglers;
                }

                else if(this.ptData[p].connections.length == 0) {
                    for(let iter=0;iter<2; ++iter) {
                        for(let p2=0; p2 < this.ptData[p].closestPts.length;++p2) {
                            let nextClosestPt = this.ptData[p].closestPts[p2];
                            if(this.ptData[p].connections.includes(nextClosestPt.index)) continue;     //if its only connection is this point, skip
                            
                            if(!this.edgeExists(p,nextClosestPt.index)) {       
                                if(this.evalNewEdge([this.pts[p],  this.pts[nextClosestPt.index]])) {
                                    let nextClosestPtObj = this.ptData[nextClosestPt.index];
                                    
                                    nextClosestPtObj.connections.push(p);                 //add node a to node b's connections 
                                    this.ptData[p].connections.push(nextClosestPt.index);   //add node b to node a's connections 
                                    this.edges.push({id:`edge${p}_${nextClosestPt.index}`, data:[p,nextClosestPt.index]});    //add new edge to edges
            
                                    //makes it possible to adjust associated edges whenever a vertex is dragged
                                    // if(!this.ptData[p].edgeIDs.includes(`edge${p}_${nextClosestPt.index}`)) this.ptData[p].edgeIDs.push(`edge${p}_${nextClosestPt.index}`);
                                    // if(!this.ptData[p2].edgeIDs.includes(`edge${p}_${nextClosestPt.index}`)) this.ptData[nextClosestPt.index].edgeIDs.push(`edge${p}_${nextClosestPt.index}`);

                                    if(!this.ptData[p].edgeIDs.includes(`edge${p}_${nextClosestPt.index}`) && !this.ptData[p].edgeIDs.includes(`edge${nextClosestPt.index}_${p}`)) this.ptData[p].edgeIDs.push(`edge${p}_${nextClosestPt.index}`);
                                    if(!this.ptData[p2].edgeIDs.includes(`edge${p}_${nextClosestPt.index}`) && !this.ptData[p2].edgeIDs.includes(`edge${nextClosestPt.index}_${p}`)) this.ptData[p2].edgeIDs.push(`edge${p}_${nextClosestPt.index}`);
                                }
                               
                            }
                        }
                    }
                    if(this.ptData[p].connections.length >= 2) {console.log("worked"); --numStragglers;}
                    
                }
            }
        }
    }
    DFS(index,path) {
        let subPath = Array.from(path);     
        this.visitedDFS[index] = 1;
        if(subPath.length==0) {       //root vertex
            
            subPath.push(index)
            for(let i=0; i < this.ptData[index].connections.length;++i) {    //immediate connections of root vertex
                //if(this.ptData[index].connections[i]==index) continue;
                //if(this.visitedDFS[this.ptData[index].connections[i]] == 1) continue;
                this.visitedDFS[this.ptData[index].connections[i]] = 1;
                //subPath.push(this.ptData[index].connections[i]);
                this.DFS(this.ptData[index].connections[i],  subPath.concat(this.ptData[index].connections[i]));
                
            }
        }
        else if(subPath.length==1) {  //immediate connection of vertex
            for(let i=0;i < this.ptData[index].connections.length;++i) {    //connections of immediate connection of root vertex
                if(subPath[subPath.length-2] ==this.ptData[index].connections[i]) continue;
                if(this.visitedDFS[this.ptData[index].connections[i]] == 1)  {
                    subPath.push(this.ptData[index].connections[i]);
                    let isUnique = true;
                    for(let i =0; i < this.cyclesDFS.length; ++i) {
                        if(subPath.length==this.cyclesDFS[i]) {
                            let matches = true;
                            for(let j=0; j < subPath.length; ++j) {
                                if(!this.cyclesDFS[i].includes(subPath[j])) matches=false;
                            }
                            if(matches) isUnique = matches;
                        }
                    }
                    if((subPath.length > 2) && isUnique) {
                        this.cyclesDFS.push(subPath);  
                        //subPath = [];
                        return;
                    }
                    
                }
                else {
                    this.visitedDFS[this.ptData[index].connections[i]] = 1;
                    this.DFS(this.ptData[index].connections[i],  subPath.concat(this.ptData[index].connections[i]));
                }
                
            }
        }    
        else if(subPath.length>1) {           //connection of connection of vertex (now, you can test for loops)
            console.log('subPath',subPath)
            for(let i=0;i < this.ptData[index].connections.length;++i) { 
                if(subPath[subPath.length-2] == this.ptData[index].connections[i]) continue;
                if(this.visitedDFS[this.ptData[index].connections[i]] == 1) {
                    // if(subPath.includes(this.ptData[index].connections[i])) {
                    //     subPath = subPath.slice(subPath.indexOf(this.ptData[index].connections[i]));
                    // }
                    // else subPath.push(this.ptData[index].connections[i]);
                    subPath.push(this.ptData[index].connections[i]);
                    let isUnique = true;
                    for(let i =0; i < this.cyclesDFS.length; ++i) {
                        if(subPath.length==this.cyclesDFS[i]) {
                            let matches = true;
                            for(let j=0; j < subPath.length; ++j) {
                                if(!this.cyclesDFS[i].includes(subPath[j])) matches=false;
                            }
                            if(matches) isUnique = matches;
                        }
                    }
                    if((subPath.length > 2) && isUnique) {
                        this.cyclesDFS.push(subPath);
                        //subPath = [];
                        return;
                    }
                    
                }
                
                else {
                    this.visitedDFS[this.ptData[index].connections[i]] = 1;
                    this.DFS(this.ptData[index].connections[i],  subPath.concat(this.ptData[index].connections[i]));
                }
                
                
                // const summation = (previousValue, currentValue) => previousValue + currentValue;
                // console.log(this.visitedDFS.reduce(summation), this.ptData.length)
                // if(this.visitedDFS.reduce(summation) < this.ptData.length) 
                // else return;
      
            }
        }   
        return;

    }


    depthFirstSearch() {
        // let index = 0;
        // var paths = [];
        for(let i =0; i < this.ptData.length;++i) {
            this.visitedDFS[i] = 0;
        }
        this.DFS(0,[]);
        // for(let i =0; i < this.ptData.length; ++i) {
        //     for(let i =0; i < this.ptData.length;++i) {
        //         this.visitedDFS[i] = 0;
        //     }
        //     this.DFS(i,[]);
        // }
        // var edgeIDS = this.edges.map(x=>{return x.id});
        // edgeIDS = edgeIDS.join(" ");
        // for(let i =0; i < this.cyclesDFS;++i) {
        //     for(let j=0;j < this.cyclesDFS[i];++j) {
        //         if()
        //     }
        //     edgeIDS.search()
            
        // }

        
        
        

        console.log('cyclces',this.cyclesDFS);
        // const summation = (previousValue, currentValue) => previousValue + currentValue;

        // let numVertices = this.ptData.length;
        // while(this.visitedDFS.reduce(summation) < numVertices) {
        //     var currentPath = [];

           
        //     for(let i=0; i < this.ptData[index].connections.length;++i) {    //immediate connections of root vertex
        //         //if(this.ptData[index].connections[i]==index) continue;
        //         //if(this.visitedDFS[this.ptData[index].connections[i]] == 1) continue;
        //         if(currentPath.length==0) {}       //root vertex


        //         this.visitedDFS[this.ptData[index].connections[i]] = 1;

        //         //this.DFS(this.ptData[index].connections[i],[index]);


                
        //     }
        //     index = this.ptData[index].connections[i]
        //     //this.visitedDFS[index] = 1;
        // }
        

        
    }


        

        

        
    




    // trackPolygons() {
    //     for(let p=0; p < this.ptData.length;++p) {            //any Point A
    //         let pt = this.ptData[p];
    //         let ptNeighbors = pt.connections;

    //         for(let p2=0; p2 < ptNeighbors.length; ++p2) {      //any of Point A's connections, Point B
    //             let otherPt = this.ptData[ptNeighbors[p2]];
    //             let otherPtNeighbors = otherPt.connections;
    //             console.log(otherPtNeighbors,'asdf');
    //             for(let p3=0; p3 < otherPtNeighbors.length; ++p3) {     //Point B's connections (exclude Point A)
                    
    //                 if(otherPtNeighbors[p3]==pt.index){ 
                    
    //                     continue;
    //                 }
                   
    //                 let distantPt = this.ptData[otherPtNeighbors[p3]];
    //                 let distantPtNeighbors = distantPt.connections;

    //                 if(distantPtNeighbors.includes(pt.index)) {    //loop completed as a triangle
    //                     console.log('polygon', pt, otherPt, distantPt)
    //                     //let polyObj = new Polygon;

    //                     let newPolygon = document.createElementNS("http://www.w3.org/2000/svg",'path');
    //                     newPolygon.setAttributeNS(null,'id',`polygon${pt.index}_${otherPt.index}_${distantPt.index}`);
    //                     let d = `
    //                         M ${this.pts[pt.index].x},${this.pts[pt.index].y}
    //                         L ${this.pts[otherPt.index].x},${this.pts[otherPt.index].y}
    //                         L ${this.pts[distantPt.index].x},${this.pts[distantPt.index].y}
    //                         L ${this.pts[pt.index].x},${this.pts[pt.index].y}
    //                     `

    //                     newPolygon.setAttributeNS(null,'d',d);
    //                     //let hue = getRandomInt(0,355);
    //                     let hue = 220;
    //                     let sat = getRandomInt(0,100);
    //                     let light = getRandomInt(0,100);
    //                     // newPolygon.setAttributeNS(null,'fill',`hsl(${hue},50%,50%)`);
    //                     newPolygon.setAttributeNS(null,'fill',`hsl(${hue},${sat}%,${light}%)`);
    //                     newPolygon.setAttributeNS(null,'stroke', 'black');
    //                     regionGroup.appendChild(newPolygon); 
    //                 }
    //             }
    //         }
    //     }
    // }


    
}

export class Polygon {
    constructor(pts) {
        this.pts = pts;
    }
}

