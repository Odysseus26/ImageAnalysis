import * as PImage from "pureimage";
import * as fs from "fs";


export default async function createImage(dataTable,outBound_pathway){
    const height = dataTable.length;
    const width = dataTable[0].length;

    const img = PImage.make(width, height);
    const ctx = img.getContext("2d");

    const imageData = ctx.getImageData(0, 0, width, height);

    for (let y = 0; y < height; y++) {        // row
    for (let x = 0; x < width; x++) {       // column
        const idx = (y * width + x) * 4;
        const temp = dataTable[y][x];

        imageData.data[idx]     = temp.r;
        imageData.data[idx + 1] = temp.g;
        imageData.data[idx + 2] = temp.b;
        imageData.data[idx + 3] = temp.a;
    }
    }

    ctx.putImageData(imageData, 0, 0);

    if (!outBound_pathway.endsWith(".png")) {
    throw new Error("Error! OutBound Pathway fails writeout from wrong type.");
    }

    await PImage.encodePNGToStream(
    img,
    fs.createWriteStream(outBound_pathway)
    );
}