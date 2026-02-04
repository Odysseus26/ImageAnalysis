import { Jimp } from "jimp";

export default async function resizeImage(height_constraint,width_constraint,pathway,outBound_pathway) {
  const image = await Jimp.read(pathway);

  image.resize({ w: width_constraint, h: height_constraint });

  await image.write(outBound_pathway);
  return 1;
}

