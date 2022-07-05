import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Resizeable } from './Components/Resizeable';
import { ContextMenu } from './Components/ContextMenu';
import { Menu } from './Components/AppMenu';
import { getAveragePixelBrightness, turnImageBinary, convertCTXToColorArray, getColumnEdgeCount, getRowEdgeCount, getMode, getSubsections } from './Components/EdgeTextExtraction.mjs';

import testvideomp4 from "./TestVideo.mp4";
import testvideo2mp4 from "./TestVideo2.0.mp4"
import testvideo3mp4 from "./TestVideo3.0.mp4"
import testvideowebm from "./TestVideo.webm";
import testvideogv from "./TestVideo.ogv";
import tableSample from "./TableSample.jpg"
import tableSampleCleaned from "./TableSampleCleaned.png";
import msTableSample from "./MSWordTableSample.png";



const { createWorker, PSM } = require("tesseract.js");

// ========================================

const vidWidth = 800;
const vidHeight = 450;

// Disables default right click option

export default function VideoApp() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const resizeableRef = useRef(null);
  const displayCanvasRef = useRef(null);
  const [appMenuDisplay, setAppMenuDisplay] = useState("none");
  const [extractedText, setExtractedText] = useState("");

  function displayAppMenu() {
    setAppMenuDisplay("block");
  }

  function drawCanvas(canvas) {
    const video = videoRef.current;

    const canvasImageWidth = canvas.width;
    const canvasImageHeight = canvas.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvasImageWidth, canvasImageHeight);

    return canvas;
  }

  function formRectanglesFromImage() {
    const PIXEL_DIFF_THRESHOLD = 100;
    const CANVAS_WIDTH = 1920;
    const CANVAS_HEIGHT = 1080;
    const SUBSECTION_TOLERANCE = 40;

    const canvas  = canvasRef.current;
    const ctx = canvas.getContext("2d");

    //const avgPixelBrightness = getAveragePixelBrightness(ctx);
    //turnImageBinary(ctx, avgPixelBrightness);
    //console.log(avgPixelBrightness);

    const ctxArray = convertCTXToColorArray(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
    console.log(ctxArray)

    const colEdges = getColumnEdgeCount(ctxArray, CANVAS_WIDTH, CANVAS_HEIGHT, PIXEL_DIFF_THRESHOLD);
    console.log(colEdges);

    const rowEdges = getRowEdgeCount(ctxArray, CANVAS_WIDTH, CANVAS_HEIGHT, PIXEL_DIFF_THRESHOLD);
    console.log(rowEdges);

    const mode = getMode(rowEdges);
    console.log(mode);

    const [rowSubsections, numRows] = getSubsections(rowEdges, mode, SUBSECTION_TOLERANCE);
    const [colSubsections, numColumns] = getSubsections(colEdges, mode, SUBSECTION_TOLERANCE);
    console.log(colSubsections);
    console.log(rowSubsections);

    let rowBuffer = 60;
    if (rowSubsections.length > 0) {
      rowBuffer = (rowSubsections[2].End - rowSubsections[2].Start) / 2;
    }

    let colBuffer = 60;
    if (colSubsections.length > 0) {
      colBuffer = (colSubsections[2].End - colSubsections[2].Start) / 2; 
    }
    
    //ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draws the boxes around the 
    for (let i = 0; i < rowSubsections.length ; i++) {
      const subsection = rowSubsections[i];
      if (subsection.IsText === true) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, subsection.Start, 1920, (subsection.End - subsection.Start));
      }
    }

    for (let i = 0; i < colSubsections.length ; i++) {
      const subsection = colSubsections[i];
      if (subsection.IsText === true) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.strokeRect(subsection.Start, 0, (subsection.End - subsection.Start), 1080);
      }
    }
    
    ctx.strokeStyle = 'green';
    const rectangles = [];
    for (let i = 0; i < rowSubsections.length; i++) {
      const rowSubsection = rowSubsections[i];
      if (rowSubsection.IsText === true) {
        for (let j = 0; j < colSubsections.length; j++) {
          const colSubsection = colSubsections[j];

          if (colSubsection.IsText === true) {
            const rectangle = {
                              left: colSubsection.Start - colBuffer,
                              top: rowSubsection.Start - rowBuffer,
                              width: (colSubsection.End - colSubsection.Start) + colBuffer * 2,
                              height: (rowSubsection.End - rowSubsection.Start) + rowBuffer * 2,
                              }
            
            ctx.strokeRect(rectangle.left, rectangle.top, rectangle.width, rectangle.height);
            rectangles.push(rectangle);
          }
        }
      }
    }

    return [rectangles, numRows, numColumns];
  }

  function extractText(rectangles, numRows, numCols, callback) {
    const worker = createWorker();
    const canvas = canvasRef.current
    console.log(rectangles)
    const ctx = canvas.getContext("2d");
    //ctx.strokeRect(rectangle.top, rectangle.left, rectangle.width, rectangle.height);

    console.log("Starting Read");
    (async () => {
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
      });
      const values = [];

      for (let i = 0; i < rectangles.length; i++) {
        const { data: { text } } = await worker.recognize(canvas, { rectangle: rectangles[i] });
        values.push(text.slice(0, -1))
      }
      console.log(values);
      console.log("Done");

      await worker.terminate();

      if (callback != null) {
        callback(values, numRows, numCols);
      }
      
    })();
  }

  function copyTextToClipboard(text) { // Wrapper function needed to keep document in focus while running Tesseract code
    navigator.clipboard.writeText(text);  
  }
  return (
    <div>
      <ContextMenu displayAppMenu={displayAppMenu}/>
      <Menu extractedText = {extractedText} setExtractedText = {setExtractedText}
       display={appMenuDisplay} canvasRef={canvasRef} videoRef={videoRef} displayCanvasRef={displayCanvasRef}
       resizeableRef={resizeableRef} drawCanvas={drawCanvas} extractText={extractText} formRectanglesFromImage={formRectanglesFromImage}/>
      
      <video ref={videoRef} id = "video" width={vidWidth} height={vidHeight} controls autoPlay loop muted>
        <source src={testvideo3mp4} type="video/mp4" />
        <source src={testvideowebm} type="video/webm" />
        <source src={testvideogv} type="video/ogg" />
        Sorry no video

      </video>
      <canvas id = "canvas" ref={canvasRef} width="1920" height="1080" style={{"left": "80px","top": "800px",
                                                    "width": "800px", "height": "450px"}}>

      </canvas>
      
    </div>
  );
} 
/** 
const root = ReactDOM.createRoot(
  document.getElementById("root")
);

root.render(<VideoApp />);
**/

//<canvas ref = {canvasRef} id="canvas" style={{"top": 80, "left": 80}}> </canvas>
//<Resizeable theRef = {ref} width={vidWidth} height={vidHeight}/>