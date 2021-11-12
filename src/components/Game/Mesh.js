import { det,getRandomInt } from "../utility.js";

export class Mesh {
    constructor(parent, pts=null) {
        this.parent = parent;
        if(pts==null) this.pts=[];
        else this.pts = pts;
        this.ptData = [];
        this.edges = []
        this.polygons = {};

        this.hasIntersection2D = this.hasIntersection2D.bind(this);
        this.evalNewEdge = this.evalNewEdge.bind(this);
        this.edgeExists = this.edgeExists.bind(this);
        this.polygonIsValid = this.polygonIsValid.bind(this);
        this.polygonExists = this.polygonExists.bind(this);
        this.handleStragglers = this.handleStragglers.bind(this);
        this.getAngleOfLines = this.getAngleOfLines.bind(this);

        this.depthFirstSearch = this.depthFirstSearch.bind(this);
        this.DFS = this.DFS.bind(this);
        this.visitedDFS = [];
        this.cyclesDFS = [];
        this.update = this.update.bind(this);
        
        this.generateEdges = this.generateEdges.bind(this);
        this.build = this.build.bind(this);

        this.pathsToOrigin = null;

        this.getShortestPath = this.getShortestPath.bind(this);

        this.getEdge = this.getEdge.bind(this);
        this.animateMesh = false;
        
       
    }

    build(numPts, random=false) {
        const summation = (previousValue, currentValue) => previousValue + currentValue;
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

                let topPercentile = Math.ceil(closestPts.length/10);
                let topPts = closestPts.slice(0,topPercentile);
                
                topPts = topPts.map(x=> {return x.squaredDist});
                let closestAvgDist = topPts.reduce(summation)/topPercentile

                this.ptData.push({
                    index:i, 
                    closestPts:closestPts, 
                    connections:[], 
                    edgeIDs:[], 
                    closestAvgDist:closestAvgDist,
                    associatedPolygons:0});
            }
        }
        
    }

    generateEdges() {
        var sortedByDensity = Array.from(this.ptData);
        sortedByDensity.sort( function(a,b) {
            return a.closestAvgDist - b.closestAvgDist;
        });
        console.log('sortedByDensity',sortedByDensity)

        //using sortedByDensity to start with the points that are most strongly connected 
        // strongly connected  ==> (least average distance between closest neighbors)
        for(let a=0; a < sortedByDensity.length; ++a) {
            //  closestPts[0] ===> closest point
            //  closestPts[numPts-1] ==> farthest point
            
            //first try this: find set-intersections of the top 5 closest points to point A
            let aTop5 = sortedByDensity[a].closestPts.map(x=>{return x.index;}).slice(0,4);
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
                    let pt1 = commonTopPts[p];
                    let pt2 = commonTopPts[p2];
                    if(!this.edgeExists(pt1,pt2)) {
                       
                        if(this.evalNewEdge(pt1,pt2)) {
                            if(!this.ptData[pt2].connections.includes(pt1) && !this.ptData[pt1].connections.includes(pt2)) {
                                this.ptData[pt2].connections.push(pt1);                 //add node a to node b's connections 
                                this.ptData[pt1].connections.push(pt2);   //add node b to node a's connections 
                                
                                this.edges.push({               //add new edge to edges
                                    id:`edge${pt1}_${pt2}`, 
                                    data:[pt1,pt2],
                                    polygonUsageCount:0 });    
                            
                                //makes it possible to adjust associated edges whenever a vertex is dragged
                                if(!this.ptData[pt1].edgeIDs.includes(`edge${pt1}_${pt2}`) && !this.ptData[pt1].edgeIDs.includes(`edge${pt2}_${pt1}`)) {
                                    this.ptData[pt1].edgeIDs.push(`edge${pt1}_${pt2}`);
                                }
                                if(!this.ptData[pt2].edgeIDs.includes(`edge${pt1}_${pt2}`) && !this.ptData[pt2].edgeIDs.includes(`edge${pt2}_${pt1}`)) {
                                    this.ptData[pt2].edgeIDs.push(`edge${pt1}_${pt2}`);
                                }  
                            }
                                         
                        }
                    }
                }
            }
        }
        // for(let a=0; a < this.pts.length; ++a) {
        //     //  closestPts[0] ===> closest point
        //     //  closestPts[numPts-1] ==> farthest point
            
        //     //first try this: find set-intersections of the top 5 closest points to point A
        //     let aTop5 = this.ptData[a].closestPts.map(x=>{return x.index;}).slice(0,4);
        //     let bTop5 = this.ptData[aTop5[0]].closestPts.map(x=>{return x.index;}).slice(0,4);
        //     let cTop5 = this.ptData[aTop5[1]].closestPts.map(x=>{return x.index;}).slice(0,4);
        //     let dTop5 = this.ptData[aTop5[2]].closestPts.map(x=>{return x.index;}).slice(0,4);
         

        //     //designed to handle dense groups of points first
        //     let commonTopPts = aTop5.concat(bTop5,cTop5,dTop5);
        //     commonTopPts = commonTopPts.filter(p => aTop5.includes(p));
        //     commonTopPts = commonTopPts.filter(p => bTop5.includes(p));
        //     commonTopPts = commonTopPts.filter(p => cTop5.includes(p));
        //     commonTopPts = commonTopPts.filter(p => dTop5.includes(p));
        //     commonTopPts = commonTopPts.concat(aTop5);
            
        //     for(let p=0; p < commonTopPts.length; ++p) {
        //         for(let p2=0; p2 < commonTopPts.length; ++p2) {
        //             if(p==p2) continue;
        //             if(commonTopPts[p]==commonTopPts[p2]) continue;
        //             let pt1 = commonTopPts[p];
        //             let pt2 = commonTopPts[p2];
        //             if(!this.edgeExists(pt1,pt2)) {
        //                 if(this.evalNewEdge([this.pts[pt1],  this.pts[pt2]])) {
                            
        //                     this.ptData[pt2].connections.push(pt1);                 //add node a to node b's connections 
        //                     this.ptData[pt1].connections.push(pt2);   //add node b to node a's connections 
                            
        //                     this.edges.push({id:`edge${pt1}_${pt2}`, data:[pt1,pt2]});    //add new edge to edges
                           
        //                     //makes it possible to adjust associated edges whenever a vertex is dragged
        //                     if(!this.ptData[pt1].edgeIDs.includes(`edge${pt1}_${pt2}`) && !this.ptData[pt1].edgeIDs.includes(`edge${pt2}_${pt1}`)) {
        //                         this.ptData[pt1].edgeIDs.push(`edge${pt1}_${pt2}`);
        //                     }
        //                     if(!this.ptData[pt2].edgeIDs.includes(`edge${pt1}_${pt2}`) && !this.ptData[pt2].edgeIDs.includes(`edge${pt2}_${pt1}`)) {
        //                         this.ptData[pt2].edgeIDs.push(`edge${pt1}_${pt2}`);
        //                     }               
        //                 }
        //             }
        //         }
        //     }
        // }

        //handle stragglers
        this.handleStragglers();
    }
    
    getAngleOfLines(lineA, lineB) {
        //lineA ==> this.M.edges[e].data , which has format [{x:x, y:y}, {x:x, y:y}]
        //lineB ==> this.M.edges[e].data , which has format [{x:x, y:y}, {x:x, y:y}]

        var dxLineA = lineA[1].x - lineA[0].x;
        var dyLineA = lineA[1].y - lineA[0].y;

        var dxLineB = lineB[1].x - lineB[0].x;
        var dyLineB = lineB[1].y - lineB[0].y;

        var angle = Math.atan2(dxLineA*dyLineB - dyLineA*dxLineB, dxLineA*dxLineB + dyLineA*dyLineB);
        angle = angle<0? angle*=-1 : angle;
        console.log("angle", angle*(180/Math.PI));
        return angle*(180/Math.PI);


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


    evalNewEdge(pt1,pt2) {
        let newEdge = [this.pts[pt1],  this.pts[pt2]]
        let successful = true;
        for(let e=0; e < this.edges.length;++e) {
            let currentEdge = [this.pts[this.edges[e].data[0]], this.pts[this.edges[e].data[1]]];
            if(this.hasIntersection2D(currentEdge,newEdge)) { successful = false; }
            // if(this.edges[e].data.includes(pt1) || this.edges[e].data.includes(pt2)) {
            //     if(this.getAngleOfLines(currentEdge,newEdge) < 20) successful = false;
            // }
            
        }
        return successful;
    }
    getEdge(ptA,ptB) {
        let tryA = this.edges.find(l=>l.data[0]==ptB && l.data[1]==ptA);
        let tryB = this.edges.find(l=>l.data[0]==ptA && l.data[1]==ptB);

        if(tryA!=undefined) return tryA;
        else if(tryB!=undefined) return tryB;
        else return -1;
    }
    edgeExists(ptA,ptB) {
        return !((this.edges.find(l=>l.data[0]==ptB && l.data[1]==ptA)==undefined) && (this.edges.find(l=>l.data[0]==ptA && l.data[1]==ptB)==undefined));
    }

    getShortestPath(ptA, ptB, omitVertices=null) {
        if(edgeExists(ptA,ptB)) return 1;   //means they are directly connected
        else {
            var paths = [];
            
            for(let i =0; i < this.ptData[ptA].connections; ++i) {
                this.ptData[ptA].connections[i]
            }
        }

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
                            
                            //if(this.evalNewEdge([this.pts[p],  this.pts[nextClosestPt.index]])) {
                            if(this.evalNewEdge(p , nextClosestPt.index)) {
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
                                //if(this.evalNewEdge([this.pts[p],  this.pts[nextClosestPt.index]])) {
                                if(this.evalNewEdge(p , nextClosestPt.index)) {
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
                    if(this.ptData[p].connections.length >= 2) { --numStragglers;}
                }
            }
        }
    }
    polygonExists(newPolygon) {
        var result = false;
        if(this.polygons.length==0) return result;
        var existingPolygons = Object.values(this.polygons).map(x=>x.toString());
        
        var newPolygonVersions = []
        var tempArray = Array.from(newPolygon)
        for(var i =0; i < newPolygon.length; ++i) {
            tempArray=tempArray.slice(1).concat(tempArray[0]);
            newPolygonVersions.push(tempArray.toString());
        }
        for(let i=0; i < newPolygonVersions.length;++i) {
            if(existingPolygons.includes(newPolygonVersions[i])) result = true;
        }
        return result;
        

    }
    polygonIsValid(polygon,incrementUsageCounts=false) {
        let result = true;
        
        for(let i =0; i < polygon.length; ++i) {
            if(i==polygon.length-1) {
                
                if(this.edgeExists(polygon[i],polygon[0])==false) {result = false;}
                else {
                    let Edge = this.getEdge(polygon[i],polygon[0]);
                    if(Edge.polygonUsageCount >= 2) result = false;
                }
            }
            else {
                
                if(this.edgeExists(polygon[i],polygon[i+1])==false) {result=false;}
                else {
                    let Edge = this.getEdge(polygon[i],polygon[i+1]);
                    if(Edge.polygonUsageCount >= 2) result = false;
                }
            }
        }
        if(result && incrementUsageCounts) {
            for(let i =0; i < polygon.length; ++i) {
                if(i==polygon.length-1) {
                    ++this.getEdge(polygon[i],polygon[0]).polygonUsageCount;  
                }
                else {
                    ++this.getEdge(polygon[i],polygon[i+1]).polygonUsageCount;  
                }
            }
        }
        
        return result;
    }
    

    DFS(index,path, goal, excludeVertices=null) {
        var subPath = Array.from(path);    
        //var subPath = path;
        if(subPath.length==0) {       //root vertex
            this.visitedDFS[index] = 1;
            for(let i=0; i < this.ptData[index].connections.length;++i) {    //immediate connections of root vertex
                let nextPt = this.ptData[index].connections[i];
                if(this.ptData[index].connections[i]==index) continue;
                if(this.getEdge(index,nextPt).polygonUsageCount >=2) continue;
                //if(this.visitedDFS[this.ptData[index].connections[i]] == 0) {
                else {
                    this.visitedDFS[this.ptData[index].connections[i]] = 1;
                    this.pathsToOrigin[this.ptData[index].connections[i]].shortestPath = [];
                    
                    this.DFS(this.ptData[index].connections[i],  subPath.concat(index,this.ptData[index].connections[i]), goal  );
                    
                }
            }
        }
        else if(subPath.length==2) {  //immediate connection of vertex
            
            for(let i=0;i < this.ptData[index].connections.length;++i) {    //connections of immediate connection of root vertex
                let nextPt = this.ptData[index].connections[i];
                if(subPath[subPath.length-2] == nextPt) continue;
                if(this.getEdge(index,nextPt).polygonUsageCount >=2) continue;

                
                else {
                //if(this.visitedDFS[this.ptData[index].connections[i]] == 0) {
                    
                    this.visitedDFS[nextPt] = 1;
                    this.DFS(nextPt,  subPath.concat(nextPt), goal);
                }
            }
        }
        else if(subPath.length==3) {
            for(let i=0; i < this.ptData[index].connections.length; ++i) { 
                let nextPt = this.ptData[index].connections[i];
                var Edge = this.getEdge(index,nextPt);
                if(Edge.polygonUsageCount >=2) continue;
                if(subPath[subPath.length-2] == nextPt) continue;
                if(nextPt == goal) {

                    // this.pathsToOrigin[nextPt].shortestPath = [subPath[0]];
                    this.visitedDFS[nextPt] = 1;
                    console.log("triangle");

                    if(!this.polygonExists(subPath)) {
                        if(this.polygonIsValid(subPath,true)) {
                            this.cyclesDFS.push(subPath); 
                        }
                    }
                    
                }
                else if(this.visitedDFS[nextPt]==0){
                    this.visitedDFS[nextPt] = 1;
                    this.DFS(nextPt,  subPath.concat(nextPt));
                }
            }
        }   
        else if(subPath.length>3) {           //connection of connection of vertex (now, you can test for loops)
        
            for(let i=0; i < this.ptData[index].connections.length; ++i) { 
                let nextPt = this.ptData[index].connections[i];
                var Edge = this.getEdge(index,nextPt);
                if(Edge.polygonUsageCount >=2) continue;
                if(subPath[subPath.length-2] == nextPt) continue;
               
                // if(nextPt == subPath[0]) {
                //     this.pathsToOrigin[nextPt].shortestPath = [subPath[0]];
                // }

                
                if(subPath.includes(nextPt)) { 
                    subPath = subPath.slice(subPath.indexOf(nextPt));  
                    if(!this.polygonExists(subPath)) {
                        if(this.polygonIsValid(subPath,true)) {
                            this.cyclesDFS.push(subPath); 
                        }
                    }
                }
                // else if(this.visitedDFS[nextPt] == 1) {
                
                //     if(!this.polygonExists(subPath)) {
                //         if(this.polygonIsValid(subPath,true)) {
                //             this.cyclesDFS.push(subPath); 
                //         }
                //     }
                    
                    
                // }
                
                else {
                    this.visitedDFS[nextPt] = 1;
                    
                    
                    this.DFS(nextPt,  subPath.concat(nextPt));
                }

            }
        }   
        return;

    }


    depthFirstSearch() {

        this.pathsToOrigin = Array(this.ptData.length).fill({shortestPath:[]});
        

        for(let i =0; i < this.ptData.length;++i) {
            this.visitedDFS[i] = 0;
        }

        // for(let j=0; j < this.ptData.length;++j) {
        //     this.ptData[j].associatedPolygons = 0;
        // }
        this.DFS(0,[], 0);
        // for(let i =0; i < this.ptData.length; ++i) {
        //     for(let i =0; i < this.ptData.length;++i) {
        //         this.visitedDFS[i] = 0;
        //     }
        //     this.DFS(i,[]);
        // }
        console.log('cycles',this.cyclesDFS);

        

        
    }

}

export class Polygon {
    constructor(meshID,vertices,parentMatrix=null) {
        this.parentMatrix = parentMatrix;
        this.meshID = meshID;
        this.vertices = vertices;
        
    }
}
