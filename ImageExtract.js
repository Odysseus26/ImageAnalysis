import { Jimp } from "jimp";
import { intToRGBA } from "@jimp/utils";
import fs from "fs";
import ExifReader from "exifreader";


 export default async function ImageRead(pathway) {
  const buffer = fs.readFileSync(pathway)
  const tags = ExifReader.load(buffer)

  const width = tags['Image Width'].value;
  const height = tags['Image Height'].value
  const image = await Jimp.read(fs.readFileSync(pathway))

  let pixelData = []
  
  for(let y = 0;y < height;y++){
    let row = []
    for(let x = 0; x < width;x++){
      const pixel = image.getPixelColor(x,y)
      const {r,g,b,a} = intToRGBA(pixel)
      row.push({
        "x":x,
        "y":y,
        r:r,
        g:g,
        b:b,
        a:a
      })
    }
    pixelData.push(row)
  }
  return {
    "Pathway":pathway,
    "buffer":buffer,
    "ExifRead":tags,
    "dim":{
      "height":height,
      "width":width
    },
    "Image":image,
    "pixelData":pixelData
  }
}