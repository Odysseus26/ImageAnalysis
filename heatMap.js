import createImage from "./createImage.js";
import fs from 'fs'


function clamp255(n){
    if ( n < 0) return 0;
    return n > 255 ? 255 : n
}

//based on SectionMap
export default async function createHeatMap(pathway,outBound_pathway = false) {

    let data = fs.readFileSync(pathway)
    data = JSON.parse(data);

    const values = data.value
    const length = values.length
    const {height,width} = data.dim;
    
    let increment = 255 / (length/4)

    let endData = []
    for(let x=0;x<height;x++){
        let row = []
        for(let y=0;y<width;y++) row.push(false);
        endData.push(row)
    }
    
    for(let i=0;i<length;i++){
        const section = values[i];
        for(let w=0;w<section.length;w++){
            const row = section[w];
            for(let coords=0;coords<row.length;coords++){
                let [x,y] = row[coords];

                endData[x][y] = {
                    r:255 -  3* increment*(i+1),
                    g:255- 2* increment*(i+1),
                    b:255- 0.5* increment*(i+1),
                    a:255- increment*(i+1)
                } 
               
            }
        }
    }

    for(let i=0;i<endData.length;i++){
        for(let x=0;x<endData[0].length;x++) if(endData[i][x] == false) throw "Error! Field Not found!"
    }
    

    createImage(endData,outBound_pathway)
    return endData;
}
