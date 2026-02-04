import ImageRead from "./ImageExtract.js";
import fs from 'fs'

export default async function heatMap(pathway,outBound_pathway,limit = 0.25){
    const data = await ImageRead(pathway);
    const DiffLimit = limit;

    let fetchPixels = (row,col) => {return data.pixelData[row][col]}

    function surround(row,col){
        let up = row - 1;
        let down = row + 1;
        let left = col - 1;
        let right = col + 1;
        let positions = [[row,left],[row,right],[up,col],[down,col],[up,left],[up,right],[down,left],[down,right]];
        positions = positions.filter(element => {
        return (
            element[0] >= 0 && element[0] < data.dim.height &&
            element[1] >= 0 && element[1] < data.dim.width
            );
        });

        return positions;
    }

    function sigmod(num){
        //return (Math.E ** num - Math.E ** -num) / (Math.E ** num + Math.E ** -num)
        return 1 / (1 + Math.E ** -num) - 0.5
    }

    function comparePixels(pixel_1,pixel_2){
        let exclude = ["x","y","a"]
        let count = 0;
        let sum = 0.0
        for(let keys in pixel_1){
            if(exclude.includes(keys)) continue;
            count++;
            sum += Math.abs(pixel_1[keys] - pixel_2[keys])/255
        }
        return sum * count;
    }

    function createSection(startPoint) {
        const visited = new Set();
        const queue = [startPoint];
        let qIndex = 0;

        const encode = coords => `${coords[0]},${coords[1]}`;
        visited.add(encode(startPoint));

        while (qIndex < queue.length) {
            const [x, y] = queue[qIndex++];
            const neighbors = surround(x, y);

            for (const el of neighbors) {
                const key = encode(el);
                if (visited.has(key)) continue;

                if (sigmod(comparePixels(fetchPixels(x, y), fetchPixels(...el))) < DiffLimit) {
                    visited.add(key);
                    queue.push(el); 
                }
            }
        }

        
        const parsed = [...visited].map(item => item.split(",").map(Number));

        const groups = new Map();
        for (const [n1, n2] of parsed) {
            if (!groups.has(n1)) groups.set(n1, []);
            groups.get(n1).push([n1, n2]);
        }

        for (const arr of groups.values()) arr.sort((a, b) => a[1] - b[1]);

        const compliedReturn = [...groups.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(entry => entry[1]);

        return compliedReturn;
    }

    let sections = [];
    let containsIndex = new Map();
    let contested = new Map();
    
    for(let x = 0; x < data.dim.height; x++){
        for(let y = 0; y < data.dim.width; y++){
            containsIndex.set(`${x},${y}`, true);
        }
    }

    while(containsIndex.size > 0){
        let coordsKey = containsIndex.keys().next().value;
        let [sx, sy] = coordsKey.split(",").map(Number);

        let part = createSection([sx, sy]);

        let filteredPart = [];

        for(let i = 0; i < part.length; i++){
            let row = part[i];
            
            let newRow = row.filter(elem => {
                let key = `${elem[0]},${elem[1]}`;

                if (containsIndex.has(key)) {
                    containsIndex.delete(key);
                    return true;
                }

                if (!contested.has(key)) {
                    contested.set(key, true);
                }
                return false;
            });
            
            filteredPart.push(newRow);
        }
        sections.push(filteredPart);
    }
    
    try {
        fs.writeFileSync(
            outBound_pathway,
            JSON.stringify({ value: sections }, null, 2)  // pretty format (optional)
        );
        console.log("Saved to "+outBound_pathway);
    } catch (err) {
        console.error("Error writing file:", err);
    }

    return {
        "Inbound_path":pathway,
        "Outbound_path":outBound_pathway,
        "Contested":contested
    }
}

