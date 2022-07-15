/**
 * 
 import React, { useEffect, useRef } from 'react';
 import ReactDOM from 'react-dom/client';
 import '../index.css';
 
 import testvideomp4 from "../TestVideo.mp4";
 import testvideo2mp4 from "../TestVideo2.0.mp4"
 import testvideo3mp4 from "../TestVideo3.0.mp4"
 import testvideowebm from "../TestVideo.webm";
 import testvideogv from "../TestVideo.ogv";
 import tableSample from "../TableSample.jpg"
 import tableSampleCleaned from "../TableSampleCleaned.png";
 import msTableSample from "../MSWordTableSample.png";
 
  **/
import { createWorker, PSM } from "tesseract.js";
 

 
 

 
 // ========================================
 
 //const assert = require('node:assert');

 export async function helperExtractText(image, rectangles, psmMode, setExtractionLog) {
  // image is a default parameter used so we can do testing
  let worker = null;
  const multipleExtractions = rectangles.length > 1;

  if (setExtractionLog)  {
    worker = createWorker({
        logger: (m) => {
          setExtractionLog({
            status: m.status,
            progress: m.progress,
          });
        },
      });
  } else {
    worker = createWorker();
  }

  const canvas = image
  console.log(rectangles)
  //const ctx = canvas.getContext("2d");
  //ctx.strokeRect(rectangle.top, rectangle.left, rectangle.width, rectangle.height);

  console.log("Starting Read");
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  await worker.setParameters({
    tessedit_pageseg_mode: psmMode,
  });
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

export class Table {
   #rows;
   #columns;
   #contents;
 
   constructor(rows, columns) {
     this.rows = rows || 0;
     this.columns = columns || 0;
 
     this.contents = [];
     for (let i = 0; i < rows; i++) {
       this.contents.push(new Array(columns).fill(null));
     }
   } 
 
   getRows() {
     return this.rows;
   }
 
   getColumns() {
     return this.columns;
   }
 
   getCell(row, column) {
     //assert(row >= 0 && row < this.rows, "The row index is out of bounds");
     //assert(column >= 0 && column < this.columns, "The column index is out of bounds");
     return this.contents[row][column];
   }
 
   getContents() {
     return this.contents;
   }
 
   insertItem(row, column, item) {
     //assert(row >= 0 && row < this.rows, "The row index is out of bounds");
     //assert(column >= 0 && column < this.columns, "The column index is out of bounds");
     this.contents[row][column] = item;
   }
 
   removeItem(row, column) {
     //assert(row >= 0 && row < this.rows, "The row index is out of bounds");
     //assert(column >= 0 && column < this.columns, "The column index is out of bounds");
     this.contents[row][column] = null;
   }
 
   insertRow(newRowIdx) {
     //assert(newRowIdx >= 0 && newRowIdx <= this.rows + 1, "The row index is out of bounds");
 
     const newContents = this.contents.slice();
     const newArray = new Array(this.columns);
     newContents.splice(newRowIdx, 0, newArray);
 
     this.contents = newContents;
     this.rows = this.rows + 1;
   }
 
   removeRow(newRowIdx) {
     //assert(newRowIdx >= 0 && newRowIdx < this.rows, "The row index is out of bounds");
 
     const newContents = this.contents.slice();
     const newArray = new Array(this.columns);
     newContents.splice(newRowIdx, 1);
 
     this.contents = newContents;
     this.rows = this.rows - 1;
   }
 
   insertColumn(newColIdx) {
     //assert(newColIdx >= 0 && newColIdx <= this.columns + 1, "The column index is out of bounds");
 
     const newContents = this.contents.slice();
     for(let i = 0; i < this.rows; i++) {
       const newRow = newContents[i].splice(i, 0, null);
     }
 
     this.contents = newContents;
     this.columns = this.columns + 1;
   }
 
   insertColumnToRight() {
     const newContents = this.contents.slice();
     for(let i = 0; i < this.rows; i++) {
       const newRow = newContents[i].push(null);
     }
 
     this.contents = newContents;
     this.columns = this.columns + 1;
   }
 
   removeColumn(newColIdx) {
     //assert(newColIdx >= 0 && newColIdx < this.columns, "The column index is out of bounds");
 
     const newContents = this.contents.slice();
     for(let i = 0; i < this.rows; i++) {
       const newRow = newContents[i].splice(i, 1);
     }
 
     this.contents = newContents;
     this.columns = this.columns - 1;
   }
 
   convertToCSV() {
     let output = "";
 
     for(let row = 0; row < this.rows; row++) {
       for(let col = 0; col < this.columns; col++) {
         const cell = this.contents[row][col];
 
         if (cell !== null) {
           output = output.concat(cell);
         } else {
           output = output.concat("\"\"");
         }
 
         if (col !== this.columns - 1) {
           output = output.concat(",");
         }
       }
       output = output.concat("\n");
     }
 
     return output;
   }

   convertToJSON() {
    if (this.rows < 2) {
      return "{}";
    }

    let output = "["
    const headings = this.contents[0];

    for (let row = 1; row < this.rows; row++) {
      output = output.concat("{");
      for (let col = 0; col < this.columns; col++) {
        const cell = this.contents[row][col];
        const field = headings[col];
        

        if (col != this.columns - 1) {
          output = output.concat(`"${field}":"${cell}",`);
        } else {
          output = output.concat(`"${field}":"${cell}"`);
        }
      }

      if (row != this.rows - 1) {
        output = output.concat("},");
      } else {
        output = output.concat("}");
      }
      
    }

    output = output.concat("]");

    return output;
   }

   convertToHTML() {
    let output = "<table>\n";
    let hasHeading = this.rows != 1;

    for(let row = 0; row < this.rows; row++) {
      if (row === 0 && hasHeading) {
        output = output.concat("<thead>\n")
      } else if (row == 1) {
        output = output.concat("<tbody>\n")
      }

      output = output.concat("<tr>\n")
      for(let col = 0; col < this.columns; col++) {
        const cell = this.contents[row][col];

        if (cell !== null && cell !== "" && row === 0 && hasHeading) {
            output = output.concat("<th>");
            output = output.concat(cell);
            output = output.concat("</th>\n");
        } else if (cell !== null && (row !== 0 || !hasHeading)) {
            output = output.concat("<td>");
            output = output.concat(cell);
            output = output.concat("</td>\n");
        }

      }
      output = output.concat("</tr>\n");

      if (row === 0 && hasHeading) {
        output = output.concat("</thead>\n")
      } else if (row == this.rows - 1 && hasHeading) {
        output = output.concat("</tbody>\n")
      }
    }

    output = output.concat("</table>");

    return output;
   }
 
   loadTable(table) {
     this.contents = table;
     this.rows = table.length;
 
     if (table.length > 0) {
       this.columns = table[0].length;
     } else {
       this.columns = 0;
     }
     
   } 
 
  static textArrayToTable(textArray, numRows, numCols) {

    if (numRows == 0 || numCols == 0) {
      return [];
    }

    const table = new Table(numRows, numCols);
    const numCells = numRows * numCols;

    for (let i = 0; i < textArray.length && i < numCells; i++) {
      const word = textArray[i];
 
      const column = i % numCols;
      const row = Math.trunc(i / numCols);
 
      table.insertItem(row, column, word);
    }
 
    return table;
   }
 }
 
export function textToTable(text) {
   const table = new Table(1,1);
 
   const wordList = text.split(" ");
 
   let col = 0;
   let row = 0;
   console.log(wordList);
   for(let i = 0; i < wordList.length; i++) {
     const word = wordList[i];
 
     if (word === "\n") { // Add a new row, skip to the next item in the list
       table.insertRow(row + 1);
       row += 1;
       col = 0;
       continue;
     }
 
     if (col >= table.getColumns()) { // Not enough columns in table, going to add one to the right
       table.insertColumnToRight();
     }
 
     table.insertItem(row, col, word);
 
     col += 1;
   }
 
   return table;
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
