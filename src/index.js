import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Resizeable } from './Components/Resizeable';
import { ContextMenu } from './Components/ContextMenu';
import { Menu, machine} from './Components/AppMenu';
import { helperExtractText, getAveragePixelBrightness, turnImageBinary, convertCTXToColorArray, getColumnEdgeCount, getRowEdgeCount, getMode, getSubsections, getMinSubectionWidth } from './Components/EdgeTextExtraction.mjs';

import testvideomp4 from "./TestVideo.mp4";
import testvideo2mp4 from "./TestVideo2.0.mp4"
import testvideo3mp4 from "./TestVideo3.0.mp4"
import testvideowebm from "./TestVideo.webm";
import testvideogv from "./TestVideo.ogv";
import tableSample from "./TableSample.jpg"
import eng_bw from "./eng_bw.png"
import tableSampleCleaned from "./TableSampleCleaned.png";
import msTableSample from "./MSWordTableSample.png";
import image1 from "./Testing/TestingImages/image15.PNG";



const { createWorker, PSM } = require("tesseract.js");

// ========================================



const vidWidth = 1920;
const vidHeight = 1080;

// Disables default right click option

export default function VideoApp() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const resizeableRef = useRef(null);
  const displayCanvasRef = useRef(null);
  
  const [extractionLog, setExtractionLog] = useState(0);
  const [appMenuDisplay, setAppMenuDisplay] = useState("none");
  const [extractedText, setExtractedText] = useState("");
  const [extractedTable, setExtractedTable] = useState(null);
  const [extractionFocus, setExtractionFocus] = useState(null);


  function drawCanvas() {
    //const extractionFocus = extractionFocus; // The image or video being drawn on the canvas
    const resizeableElement = resizeableRef.current; // A Frame around which the image is drawn into the canvas
    const canvas = canvasRef.current;

    let focusImageWidth;
    let focusImageHeight;
    if (extractionFocus.tagName === "VIDEO") { // Sets the focusImageWidth/Height to be the actual resolution of the element focused on
      focusImageWidth = extractionFocus.videoWidth;
      focusImageHeight = extractionFocus.videoHeight;
    } else if (extractionFocus.tagName === "IMG") {
      focusImageWidth = extractionFocus.naturalWidth;
      focusImageHeight = extractionFocus.naturalHeight;      
    } else {
      focusImageWidth = extractionFocus.width;
      focusImageHeight = extractionFocus.height;   
    }
    
    // Collect CSS style information for scaling between actual resolution and apparent resolution
    const resizeableElementStyle = getComputedStyle(resizeableElement)
    const focusStyle = getComputedStyle(extractionFocus);
    const resizeableTop = parseInt(resizeableElementStyle.top, 10);
    const focusTop = parseInt(focusStyle.top, 10);
    const resizeableLeft = parseInt(resizeableElementStyle.left, 10);
    const focusLeft = parseInt(focusStyle.left, 10);
    const resizeableWidth = parseInt(resizeableElementStyle.width, 10);
    const resizeableHeight = parseInt(resizeableElementStyle.height, 10);
    const focusWidth = parseInt(focusStyle.width, 10);
    const focusHeight = parseInt(focusStyle.height, 10);

    // Scaling calculations between the apparent resolution of the extractionFocus to its actual resolution
    const videoToVideoImageScalingWidth = focusImageWidth / focusWidth;
    const videoToVideoImageScalingHeight = focusImageHeight / focusHeight;

    const destinationTop = (resizeableTop - focusTop) * videoToVideoImageScalingHeight;
    const destinationLeft = (resizeableLeft - focusLeft) * videoToVideoImageScalingWidth;
    const destinationWidth = resizeableWidth * videoToVideoImageScalingWidth;
    const destinationHeight = resizeableHeight * videoToVideoImageScalingHeight;

    // Adjust canvas actual resolution and apparent size to match dimensions needed
    canvas.width = destinationWidth;
    canvas.height = destinationHeight;
    canvas.style.width = `${destinationWidth}px`; // 'px' added to abide by css style rules
    canvas.style.height = `${destinationHeight}px`;

    // Drawing scaled image on canvas
    const ctx = canvas.getContext("2d");
    ctx.drawImage(extractionFocus, destinationLeft, destinationTop); 

    return canvas;
  }
  /**
     * Takes a CTX 2d image and divides the imagine into a 2d grid of subsections depending on the color of the pixel and the relative proximity of them
     * Text pixels are read and placed into subsections which are then returned
     *
     * @return the rectangles formed from the subsections and the num rows and num columns
  */
  function formRectanglesFromImage() {
    const PIXEL_DIFF_THRESHOLD = 100; //Difference between two pixel colors to where the Edge count regards them as different colors
    const CANVAS_WIDTH = 1920;
    const CANVAS_HEIGHT = 1080;
    const SUBSECTION_TOLERANCE = 20; // Number of pixels of different colors required sequentially to trigger switch in subsection count from "text" to "space" and vice versa

    const video = extractionFocus
    const canvas  = canvasRef.current;
    const ctx = canvas.getContext("2d");

    //const avgPixelBrightness = getAveragePixelBrightness(ctx);
    //turnImageBinary(ctx, avgPixelBrightness);
    //console.log(avgPixelBrightness);

    const ctxArray = convertCTXToColorArray(ctx, CANVAS_WIDTH, CANVAS_HEIGHT); // 2D javascript array with color info for each pixel with fast access times
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
    if (rowSubsections.length >= 2) {
      rowBuffer = getMinSubectionWidth(rowSubsections) / 2;
    }

    let colBuffer = 60;
    if (colSubsections.length >= 2) {
      colBuffer = getMinSubectionWidth(colSubsections) / 2;
    }
    
    //ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draws the boxes around the subsections
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
    //ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Draw more boxes
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
    //ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return [rectangles, numRows, numColumns];
  }

  async function extractText(rectangles, psmMode, language, isNumericalExtraction) {
    const extractionLanguage = language || "eng";
    console.log(extractionLanguage)
    return await helperExtractText(canvasRef.current, rectangles, psmMode, extractionLanguage, setExtractionLog, isNumericalExtraction);
  }

  return (
    <div>
      <ContextMenu setExtractionFocus={setExtractionFocus} setAppMenuDisplay={setAppMenuDisplay}/>

      {appMenuDisplay === "block" &&
      <Menu extractedText = {extractedText} setExtractedText = {setExtractedText}
       extractedTable = {extractedTable} setExtractedTable = {setExtractedTable} extractionLog = {extractionLog} setExtractionLog = {setExtractionLog}
       canvasRef={canvasRef} videoRef={extractionFocus} displayCanvasRef={displayCanvasRef}
       setAppMenuDisplay={setAppMenuDisplay}
       resizeableRef={resizeableRef} drawCanvas={drawCanvas} extractText={extractText} formRectanglesFromImage={formRectanglesFromImage}
       extractionFocus = {extractionFocus} setExtractionFocus={setExtractionFocus}/>}
      
      <video  id = "video" width={vidWidth} height={vidHeight} controls autoPlay loop muted>
        <source src={testvideo3mp4} type="video/mp4" />
        <source src={testvideowebm} type="video/webm" />
        <source src={testvideogv} type="video/ogg" />
        Sorry no video

      </video>

      <canvas id = "canvas" ref={canvasRef} width="1920" height="1080"  style={{"left": "1000px","top": "80px",
                                                    "width": "800px", "height": "450px"}}>

      </canvas>

      <img id = "image" src = {image1} style={{"position":"absolute", "left": "80px","top": "900px",
                                                    "width": "1920px", "height": "1080px"}} />

      
    </div>
  );
} 

// <img src={eng_bw} alt="Girl in a jacket" width="800" height="450" style={{"position" : "absolute", "left": "80px","top": "600px", "width": "800px", "height": "450px"}}/> 
//ref={videoRef}
let container = null;

document.addEventListener('DOMContentLoaded', function(event) {
  if (!container) {
    container = document.getElementById('root');
    const root = ReactDOM.createRoot(container)
    root.render(
      <VideoApp />
    );
  }
});

//<canvas ref = {canvasRef} id="canvas" style={{"top": 80, "left": 80}}> </canvas>
//<Resizeable theRef = {ref} width={vidWidth} height={vidHeight}/>