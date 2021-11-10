export function gaussianFilter(kernelLength=5,sig=1) {
    if(kernelLength%2!=1) {
        console.log("ERROR: kernelLength must be odd");
        return -1;
    }
    let kernelRadius=Math.floor(kernelLength/2);
    console.log("at kernel");


    //https://aryamansharda.medium.com/image-filters-gaussian-blur-eb36db6781b1 says to scale sigma value in proportion to radius
    //set minimum standard deviation as a baseline
    sig = Math.max((kernelRadius / 2), 1)      


    var kernel = new Array(kernelLength).fill(0).map(() => new Array(kernelLength).fill(0));
    
    var upperExp = sig*sig*2;
    var lowerExp;
    var sum = 0;
    for(var x=-kernelRadius; x <=kernelRadius; ++x) {
        for(var y=-kernelRadius; y <=kernelRadius; ++y) {
            lowerExp = (x*x) + (y*y);
           
            kernel[x+kernelRadius][y+kernelRadius] = Math.exp(-upperExp/lowerExp)/(Math.PI*lowerExp);
            
            sum += kernel[x+kernelRadius][y+kernelRadius];
        }
        
    }
    console.log("kernel",kernel);
    
    for(let x=0; x < kernelLength; ++x) {
        for(let y=0; y < kernelLength; ++y) {
            kernel[x][y] /=sum;
        }
    }
    
    
    var kernelObj = {kernel:kernel, kernelRadius:kernelRadius, sig:sig}
    
    return kernelObj;
}


export function imageReader(canvas, addr=null, filterInfo=null) {
    //from https://www.youtube.com/watch?v=-AR-6X_98rM&ab_channel=KyleRobinsonYoung

    //filterInfo will be object:    ex: {type:"gauss", kernelLength:5, sig:1}
    var kernelObj = null;
    if(filterInfo) {
        let filterLength = filterInfo.kernelLength ? filterInfo.kernelLength : 5;
        let filterSig = filterInfo.sig ? filterInfo.sig : 5;
        if(filterInfo.type == "gauss") {
            kernelObj = gaussianFilter(filterLength, filterSig);
        }
    }


    var input = addr;
    if(addr==null) {
        input = document.querySelector('input[type="file"]');
        console.log("input",input);
    }
    

   
    const file = document.querySelector('input[type=file]').files[0];
    const reader = new FileReader();
    

    reader.addEventListener("load", function () {
        const img = new Image();
        
        img.onload = function() {
            
            var context = canvas.getContext("2d");
            // canvas.width = 800;
            // canvas.height = 600;
            console.log("img.width,img.height", img.width,img.height);
            context.drawImage(img,0,0);
            
            var imageData = context.getImageData(0,0,800,600);
            var data = imageData.data;

            console.log(imageData.width,imageData.height);
            
            console.log("data.length",data.length);
            if(filterInfo) {
                for(var imgY=kernelObj.kernelRadius; imgY < imageData.height*4; imgY+=4) {       //increment by 4 because its RGBA values
                    for(var imgX=kernelObj.kernelRadius; imgX < imageData.width*4; imgX+=4) {       //increment by 4 because its RGBA values
                        // let value = kernelObj.kernel[kX+kernelObj.kernelRadius][kY+kernelObj.kernelRadius];
                        let R = 0;
                        let G = 0;
                        let B = 0;
                        for(var kX=-kernelObj.kernelRadius; kX < kernelObj.kernelRadius; ++kX) {       //increment by 4 because its RGBA values
                            for(var kY=-kernelObj.kernelRadius; kY < kernelObj.kernelRadius; ++kY) {       //increment by 4 because its RGBA values
                                let value = kernelObj.kernel[kX+kernelObj.kernelRadius][kY+kernelObj.kernelRadius];
                                
                                R += imageData.data[(imgX-kX) + (imgY-kY) + 0]*value;   
                                G += imageData.data[(imgX-kX) + (imgY-kY) + 1]*value;   
                                B += imageData.data[(imgX-kX) + (imgY-kY) + 2]*value;
                                // R += data[imgX-kX][imgY-kY][0]*value;
                                // G += data[imgX-kX][imgY-kY][1]*value;
                                // B += data[imgX-kX][imgY-kY][2]*value;
                            }
                        }
                       
                       
                        // imageData.data[(imgX) + 800*(imgY) + 0] += 25;
                        // imageData.data[(imgX) + 800*(imgY) + 0] = imageData.data[(imgX) + 800*(imgY) + 0]%255;
                        // imageData.data[(imgX) + 800*(imgY) + 1] += 25;
                        // imageData.data[(imgX) + 800*(imgY) + 1] = imageData.data[(imgX) + 800*(imgY) + 1]%255;

                        // imageData.data[(imgX) + 800*(imgY) + 2] += 25;
                        // imageData.data[(imgX) + 800*(imgY) + 2] = imageData.data[(imgX) + 800*(imgY) + 2]%255;

                        imageData.data[(imgX) + (imgY) + 0] = R;
                        imageData.data[(imgX) + (imgY) + 1] = G;
                        imageData.data[(imgX) + (imgY) + 2] = B;

        
                    }
                }
                console.log("done loading new image")
            }
       
            context.putImageData(imageData,0,0);
            // canvas.style.width="800px"
            // canvas.style.height="600px";
         
        }
        img.src = reader.result;
        
      }, false);
    
    if (file) {
        reader.readAsDataURL(file);
    }
   
    console.log(" kernelObj.kernel", kernelObj.kernel)    

    
}


// export function manip(addr=null) {
//     imageReader(addr)

    
// }