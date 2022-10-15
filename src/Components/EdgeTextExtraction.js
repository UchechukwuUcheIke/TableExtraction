
import { createWorker, PSM } from "tesseract.js";
const path = require('path');
 // ========================================


/**
    * Helper function for extraction. Calls Tesseract on the rectangular areas passed as parameters
    * @return canvas
*/
 export async function helperExtractText(image, rectangles, psmMode, extractionLanguage, setExtractionLog, isNumericalExtraction) {
  // image is a default parameter used so we can do testing
  let worker = null;
  const multipleExtractions = rectangles.length > 1;
  const languagePath = "https://raw.githubusercontent.com/UchechukwuUcheIke/TableExtraction/main/src/Languages";  // location of data files
  console.log(languagePath)
  if (setExtractionLog)  {
    console.log("Up HERE!")
    worker = createWorker({
        logger: (m) => {
          setExtractionLog({
            status: m.status,
            progress: m.progress,
          });
        },
        langPath: languagePath,
        gzip: false,
      });
  } else {
    console.log("HERE IN HERE")
    worker = createWorker({
      langPath: languagePath,
    });
  }

  const canvas = image
  console.log(rectangles)
  //const ctx = canvas.getContext("2d");
  //ctx.strokeRect(rectangle.top, rectangle.left, rectangle.width, rectangle.height);

  console.log("Starting Read");
  await worker.load();
  //await worker.loadLanguage(extractionLanguage);
  //await worker.initialize(extractionLanguage);
  await worker.loadLanguage("engstack");
  await worker.initialize("engstack");

  if (isNumericalExtraction && isNumericalExtraction === true) {
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789*.^e',
      tessedit_pageseg_mode: psmMode,
    });
  } else {
    await worker.setParameters({
      tessedit_pageseg_mode: psmMode,
    });
  }
  const values = [];

  for (let i = 0; i < rectangles.length; i++) {
    const { data: { text } } = await worker.recognize(canvas, { rectangle: rectangles[i] });
    values.push(text.slice(0, -1))

    if (multipleExtractions) {
      const progress = (i + 1) / rectangles.length;
      const status = `Cell ${i + 1}`;

      setExtractionLog({
        status: status,
        progress: progress,
      });
    }
  }
  console.log(values);
  await worker.terminate();

  return values
}
 
export function convertCTXToColorArray(ctx, width, height) {
  const colorArray = new Array(height);
  for (let row = 0; row < height; row++) {
    const rowArray = new Array(width);
    const rowImageData = ctx.getImageData(0, row, width, 1).data;
    let i = 0;
    for (let col = 0; col < width; col++) {
      rowArray[col] = [rowImageData[i], rowImageData[i + 1], rowImageData[i + 2], rowImageData[i + 3]];
      i += 4; // each image data for a pixel contains 4 values
    }
    colorArray[row] = rowArray;
  }

  return colorArray;
}
 
export function getAveragePixelBrightness(ctx) {
   // Returns a size 3 array of the average RGB values
   const sizeWidth = 1920;
   const sizeHeight = 1080;
 
   const numPixels = sizeWidth * sizeHeight;
   let sum = 0;
 
   for (let x = 0; x < sizeWidth; x++) {
     for (let y = 0; y < sizeHeight; y++) {
       const pixel = ctx.getImageData(x, y, 1, 1);
       const data = pixel.data;
       const red = data[0];
       const green = data[1];
       const blue = data[2];
 
       sum += (red + blue + green);
       
 
     }
   }
   console.log(sum);
   return sum/numPixels;
 }
 
export function getColumnEdgeCount(ctxArray, width, height, diffThreshold) {
   const edgeCountPerColumn = new Array(width);
 
   for (let x = 0; x < width; x++) {
     //let prevPixel = ctx.getImageData(x, 0, 1, 1);
     let prevPixelData = ctxArray[0][x];
     let colEdges = 0;
     for (let y = 1; y < height; y++) {
       //const pixel = ctx.getImageData(x, y, 1, 1);
       const pixelData = ctxArray[y][x];
 
       const brightnessDifference = (pixelData[0] - prevPixelData[0]) ** 2 + (pixelData[1] - prevPixelData[1]) ** 2 + (pixelData[2] - prevPixelData[2]) ** 2
 
       if (brightnessDifference > diffThreshold) {
         colEdges += 1
       }
 
       prevPixelData = pixelData
     }
 
     edgeCountPerColumn[x] = colEdges;
   }
 
   return edgeCountPerColumn
 }

export function getMinSubectionWidth(subsections) {
  let minSubsection = subsections[0];
  let minLength = minSubsection.End - minSubsection.Start
  const numSubsections = subsections.length
  for (let i = 1; i < numSubsections; i++) {
    const currentSubsection = subsections[i];

    if (currentSubsection.isText == false) {
    
      const currentLength = currentSubsection.End - currentSubsection.Start;

      if (currentLength < minLength) {
        minLength = currentLength;
        minSubsection = currentSubsection;
      }

    }
  }

  return minLength;
}
 
export function getRowEdgeCount(ctxArray, width, height, diffThreshold) {
   const edgeCountPerRow = new Array(height);
 
   for (let y = 0; y < height; y++) {
     //let prevPixel = ctx.getImageData(0, y, 1, 1);
     let prevPixelData = ctxArray[y][0];
     let rowEdges = 0;
     for (let x = 1; x < width; x++) {
       //const pixel = ctx.getImageData(x, y, 1, 1);
       const pixelData = ctxArray[y][x];
 
       const brightnessDifference = (pixelData[0] - prevPixelData[0]) ** 2 + (pixelData[1] - prevPixelData[1]) ** 2 + (pixelData[2] - prevPixelData[2]) ** 2
 
       if (brightnessDifference > diffThreshold) {
         rowEdges += 1
       }
 
       prevPixelData = pixelData
     }
 
     edgeCountPerRow[y] = rowEdges;
   }
 
   return edgeCountPerRow
 }
 
export function getMode(array) {
 
   let object = {}
 
   for (let i = 0; i < array.length; i++) {
     if (object[array[i]]) {
       // increment existing key's value
       object[array[i]] += 1
     } else {
       // make a new key and set its value to 1
       object[array[i]] = 1
     }
   }
 
   // assign a value guaranteed to be smaller than any number in the array
   let biggestValue = -1
   let biggestValuesKey = -1
 
   // finding the biggest value and its corresponding key
   Object.keys(object).forEach(key => {
     let value = object[key]
     if (value > biggestValue) {
       biggestValue = value
       biggestValuesKey = key
     }
   })
 
   return biggestValuesKey
 }
 
export function turnImageBinary(ctx, avgPixelBrightness) {
   const sizeWidth = 1920;
   const sizeHeight = 1080;
 
 
   for (let x = 0; x < sizeWidth; x++) {
     for (let y = 0; y < sizeHeight; y++) {
       const pixel = ctx.getImageData(x, y, 1, 1);
       const data = pixel.data;
       const red = data[0];
       const green = data[1];
       const blue = data[2];
 
       const brightness = red + green + blue;
       
       let rgbaValues
       if (brightness > avgPixelBrightness) {
         rgbaValues = new Uint8ClampedArray([255, 255, 255, 255]);
       } else {
         rgbaValues = new Uint8ClampedArray([0, 0, 0, 255]);
       }
       const newPixel = new ImageData(rgbaValues, 1, 1);
 
       ctx.putImageData(newPixel, x, y);
     }
   }
 
 }
 
export function getSubsections(edgeCountPerCol, mode, tolerance) {
   let start = 0;
   let end = 0;
   let isText = false;
   let numIsTextSections = 0;
   const subsections = [];
 
   const maxTolerance =  tolerance //dimensionLength / 100; // Was originally 3
   let lineTolerance = maxTolerance;
 
 
   for (let i = 0; i < edgeCountPerCol.length; i++) {
     const edge = edgeCountPerCol[i];
 
     if (edge > mode && isText === false) { // Swap from "reading lines to reading text"
       lineTolerance -= 1;
 
       if (lineTolerance == 0) {
         subsections.push({Start: start, End: end - maxTolerance, IsText: isText});
         start = i - maxTolerance;
         end = i;
         isText = true;
         lineTolerance = maxTolerance;
       }
     }
     else if (edge <= mode && isText === true) { // Swap from "reading text to reading lines"
       lineTolerance -= 1;
 
       if (lineTolerance == 0) {
         subsections.push({Start: start, End: end, IsText: isText}); // was end - maxTolerance.
         start = i - maxTolerance;
         end = i;
         isText = false;
         lineTolerance = maxTolerance;
         numIsTextSections += 1
       }
     } else {
       if (lineTolerance < maxTolerance) {
         lineTolerance += 1;
       }
       
       end += 1
     }
   }
 
   return [subsections, numIsTextSections];
 }
