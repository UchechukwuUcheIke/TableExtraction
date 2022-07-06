import React, { useState, useEffect, useRef } from 'react';
import { Resizeable, GlassPane } from './Resizeable';
import './AppMenu.css';
import { Table } from './EdgeTextExtraction.mjs';
export function Menu(props) {
    const videoRef = props.videoRef;
    const canvasRef = props.canvasRef;
    const displayCanvasRef = props.displayCanvasRef;
    const resizeableRef = props.resizeableRef;

    const canvasWidth = 450;
    const canvasHeight = 250;
    function onScreenshot() {
        const displayCanvas = displayCanvasRef.current
        const canvas  = canvasRef.current;

        props.drawCanvas(displayCanvas);
        props.drawCanvas(canvas);
    }

    async function onScanAsText() {
        const canvas = canvasRef.current;
        const displayCanvas = displayCanvasRef.current
        const resizeableElement = resizeableRef.current;

        const displayCanvasStyle = getComputedStyle(displayCanvas);
        const displayCanvasWidth = parseInt(displayCanvasStyle.width, 10);
        const canvasStyle = getComputedStyle(canvas);
        const canvasWidth = parseInt(canvasStyle.width, 10);
        // The "width" property for a canvas refers to the actually image it stores, not the size of the html object
        const canvasImageWidth = canvas.width; 

        const canvasToCanvasScaling = canvasWidth / displayCanvasWidth;
        const canvasToImageScaling = canvasImageWidth / canvasWidth;
        console.log("Scaling: " + canvasToCanvasScaling * canvasToImageScaling);

        const resizeableElementStyle = getComputedStyle(resizeableElement)
        const resizeableTop = parseInt(resizeableElementStyle.top, 10);
        const displayCanvasTop = parseInt(displayCanvasStyle.top, 10);
        const resizeableLeft = parseInt(resizeableElementStyle.left, 10);
        const displayCanvasLeft = parseInt(displayCanvasStyle.left, 10);
        const resizeableWidth = parseInt(resizeableElementStyle.width, 10);
        const resizeableHeight = parseInt(resizeableElementStyle.height, 10);
    
        const rectangleTop = resizeableTop - displayCanvasTop;
        const rectangleLeft = resizeableLeft - displayCanvasLeft;
    
        const rectangle = {left: rectangleLeft * canvasToCanvasScaling * canvasToImageScaling,
                          top: rectangleTop * canvasToCanvasScaling * canvasToImageScaling,
                          width: resizeableWidth  * canvasToCanvasScaling * canvasToImageScaling,
                          height: resizeableHeight  * canvasToCanvasScaling * canvasToImageScaling};
        console.log(rectangle);

        const textValues = await props.extractText([rectangle])
        const extractedText = textValues[0];
        props.setExtractedText(extractedText);
    }

    async function onScanAsCSVTable() {
        const [rectangles, numRows, numCols] = props.formRectanglesFromImage();

        const textValues = await props.extractText(rectangles);
        const table = Table.textArrayToTable(textValues, numRows, numCols);
        const extractedText = table.convertToCSV();
        props.setExtractedText(extractedText);
    }

    async function onScanAsHTMLTable() {
        const [rectangles, numRows, numCols] = props.formRectanglesFromImage();
    
        const textValues = await props.extractText(rectangles);
        const table = Table.textArrayToTable(textValues, numRows, numCols);
        const extractedText = table.convertToHTML();
        props.setExtractedText(extractedText);
    }

    function onCopyTextToClipboard() {
        const extractedText = props.extractedText;
        function copyTextToClipboard(text) { // Wrapper function needed to keep document in focus while running Tesseract code
            navigator.clipboard.writeText(text);  
        }

        if (document.hasFocus()) {
            copyTextToClipboard(extractedText);
        } else {
            console.log("Document out of focus, copy to clipboard failed")
        }
    }

    return (
        <div id = "Menu" style={{"display": props.display}}>
            <div id = "Display">
                <canvas id = "displayCanvas" ref={displayCanvasRef} width="1920" height="1080" style={{ "height": "240px",
                 "top": "40px", "left" : "0px"}}>

                </canvas>

                <Resizeable theRef = {resizeableRef} width={425} height={canvasHeight} 
                  minXPosition={0} maxXPosition={425} minYPosition={0} maxYPosition={450}/>
            </div>

            <div id = "Options">
                <button onClick={onScreenshot}> Screenshot </button>
                <button onClick={onScanAsText}> Scan as Text </button>
                <button onClick={onScanAsCSVTable}> Scan as CSV Table </button>
                <button onClick={onScanAsHTMLTable}> Scan as HTML Table </button>
                <button onClick={onCopyTextToClipboard}> Copy Text to Clipboard </button>
            </div>

            <div id = "OutputPreview">
                <textarea value={props.extractedText} readOnly>  </textarea>
                <canvas> </canvas>
            </div>
        </div>
    )
}