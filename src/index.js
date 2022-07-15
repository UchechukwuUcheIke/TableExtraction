import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Resizeable } from './Components/Resizeable';
import { ContextMenu } from './Components/ContextMenu';
import { Menu, machine} from './Components/AppMenu';
import { helperExtractText, getAveragePixelBrightness, turnImageBinary, convertCTXToColorArray, getColumnEdgeCount, getRowEdgeCount, getMode, getSubsections } from './Components/EdgeTextExtraction.mjs';

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
  const [processFSM, setProcessFSM] = useState(Object.create(machine));
  const [extractedTable, setExtractedTable] = useState(null);


  function drawCanvas(canvasE) {
    const video = videoRef.current;
    const resizeableElement = resizeableRef.current;
    const canvas = canvasRef.current;

    const videoImageWidth = video.width;
    const videoImageHeight = video.height;
    const canvasImageWidth = canvas.width;
    const canvasImageHeight = canvas.height;
    
    const resizeableElementStyle = getComputedStyle(resizeableElement)
    const videoStyle = getComputedStyle(video);
    const resizeableTop = parseInt(resizeableElementStyle.top, 10);
    const videoTop = parseInt(videoStyle.top, 10);
    const resizeableLeft = parseInt(resizeableElementStyle.left, 10);
    const videoLeft = parseInt(videoStyle.left, 10);
    const resizeableWidth = parseInt(resizeableElementStyle.width, 10);
    const resizeableHeight = parseInt(resizeableElementStyle.height, 10);
    const videoWidth = parseInt(videoStyle.width, 10);
    const videoHeight = parseInt(videoStyle.height, 10);

    console.log(`Resizeable Top: ${resizeableTop}`);
    console.log(`Video Top: ${videoTop}`);
    console.log(`Resizeable Left: ${resizeableLeft}`);
    console.log(`Video Left: ${videoLeft}`);

    const videoToVideoImageScalingWidth = videoImageWidth / videoWidth;
    const videoToVideoImageScalingHeight = videoImageHeight / videoHeight;

    console.log(`video To Video Image Scaling Width : ${videoToVideoImageScalingWidth }`)
    const videoToCanvasScalingWidth = canvasImageWidth / videoImageWidth;
    const videoToCanvasScalingHeight = canvasImageHeight / videoImageHeight;

    const destinationTop = (resizeableTop - videoTop) * videoToVideoImageScalingHeight  * videoToCanvasScalingHeight;
    const destinationLeft = (resizeableLeft - videoLeft) * videoToVideoImageScalingWidth  * videoToCanvasScalingWidth;
    const sourceTop = (resizeableTop - videoTop) * videoToVideoImageScalingHeight ;
    const sourceLeft = (resizeableLeft - videoLeft) * videoToVideoImageScalingWidth ;

    console.log(`Source Top: ${sourceTop}`);
    console.log(`Source Left: ${sourceLeft}`);

    const destinationWidth = resizeableWidth * videoToVideoImageScalingWidth * videoToCanvasScalingWidth;
    const destinationHeight = resizeableHeight * videoToVideoImageScalingHeight * videoToCanvasScalingHeight;
    const sourceWidth = resizeableWidth * videoToVideoImageScalingWidth;
    const sourceHeight = resizeableHeight * videoToVideoImageScalingHeight;

    console.log(sourceTop);
    console.log(sourceLeft);
    console.log(destinationWidth);
    console.log(destinationHeight);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasImageWidth, canvasImageHeight);

    // I have no idea why "1.5" makes it work, it just does. I'm not taking this headache anymore
    ctx.drawImage(video, sourceLeft / 1.5, sourceTop / 1.5, sourceWidth, sourceHeight,
        destinationLeft, destinationTop, destinationWidth * 1.5, destinationHeight * 1.5); 

    return canvas;
  }



  function formRectanglesFromImage() {
    const PIXEL_DIFF_THRESHOLD = 100;
    const CANVAS_WIDTH = 1920;
    const CANVAS_HEIGHT = 1080;
    const SUBSECTION_TOLERANCE = 40;

    const video = videoRef.current;
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

    let rowBuffer = 40;
    if (rowSubsections.length > 2) {
      rowBuffer = (rowSubsections[2].End - rowSubsections[2].Start) / 2;
    }

    let colBuffer = 40;
    if (colSubsections.length > 2) {
      colBuffer = (colSubsections[2].End - colSubsections[2].Start) / 2; 
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

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
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
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
            
            //ctx.strokeRect(rectangle.left, rectangle.top, rectangle.width, rectangle.height);
            rectangles.push(rectangle);
          }
        }
      }
    }

    return [rectangles, numRows, numColumns];
  }

  async function extractText(rectangles, psmMode) {
    return await helperExtractText(canvasRef.current, rectangles, psmMode, setExtractionLog);
  }

  return (
    <div>
      <ContextMenu setAppMenuDisplay={setAppMenuDisplay}/>

      {appMenuDisplay === "block" &&
      <Menu processFSM = {processFSM} setProcessFSM ={setProcessFSM} extractedText = {extractedText} setExtractedText = {setExtractedText}
       extractedTable = {extractedTable} setExtractedTable = {setExtractedTable} extractionLog = {extractionLog} setExtractionLog = {setExtractionLog}
       canvasRef={canvasRef} videoRef={videoRef} displayCanvasRef={displayCanvasRef}
       setAppMenuDisplay={setAppMenuDisplay}
       resizeableRef={resizeableRef} drawCanvas={drawCanvas} extractText={extractText} formRectanglesFromImage={formRectanglesFromImage}/>}
      
      <video ref={videoRef} id = "video" width={vidWidth} height={vidHeight} controls autoPlay loop muted>
        <source src={testvideo3mp4} type="video/mp4" />
        <source src={testvideowebm} type="video/webm" />
        <source src={testvideogv} type="video/ogg" />
        Sorry no video

      </video>
      <canvas id = "canvas" ref={canvasRef} width="1920" height="1080" style={{"left": "80px","top": "80px",
                                                    "width": "800px", "height": "450px"}}>

      </canvas>
      
    </div>
  );
} 

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