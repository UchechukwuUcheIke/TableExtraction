import { useRef, useState, Fragment, useCallback, useEffect  } from 'react';
import { Resizeable, GlassPane } from './Resizeable';
import { DropDownList } from './DropDownList';
import { Frame } from "./Frame.js"
import './AppMenu.css';
import { convertToStandardNotation, Table } from '../HelperClasses/helper.js';
import { helperExtractText, getAveragePixelBrightness, turnImageBinary, convertCTXToColorArray, getColumnEdgeCount, getRowEdgeCount, getMode, getSubsections, getMinSubectionWidth } from './EdgeTextExtraction.js';
import process from 'process';
const { PSM } = require("tesseract.js");






/**
 * Component rendering the dotted frame around the media being focused on. 
 * Sets the frame's dimensions to be equal to the dimensions of the media on the webpage
 *
 * 
 * return (
 *   <Frame />
 * )
 */
export function Menu(props) {
    const processFSMRef = props.processFSMRef;
    const processFSMState = props.processFSMState;
    const canvasRef = props.canvasRef; // Ref to the Canvas object where image extractions from media are stored
    //const previewCanvasRef = useRef(null);
    const extractionFocus = props.extractionFocus // The image or video being drawn on the canvas
    const resizeableRef = props.resizeableRef; // Ref to the "Frame" around media
    const extractionLog = props.extractionLog; // REACT state referencing the current state of the extraction process according to Tesseract
    const jsonCheckboxRef = useRef(null);
    const [extractionLanguage, setExtractionLanguage] = useState("eng") // State for the extraction language of tesseract
    const bottomRightCornerRef = props.bottomRightCornerRef;
    const topLeftCornerRef = props.topLeftCornerRef;
    const centerFrameRef = props.centerFrameRef;

    const [, updateState] = useState();
    //const forceUpdate = useCallback(() => updateState({}), []); // This is an antipattern atm uche, think of a way to get rid of this
    
    const [frameDimensions, setFrameDimensions] = useState(getDefaultFrameDimensions());

    useEffect(() => {
        setFrameDimensions(getDefaultFrameDimensions);
    }, [extractionFocus]);



    useEffect(() => {        
        if (processFSMState === "EXTRACTION_FOCUS") {
            console.log("HERE!!!!")
            setFrameDimensions(getDefaultFrameDimensions());
        }  
    }, [processFSMState]);



    function getDefaultFrameDimensions() {
        const video = extractionFocus;
        if (video === undefined || video.current === null) {
            return null;
        }
        const styles = window.getComputedStyle(video);
        

        const videoWidth = parseInt(styles.width, 10);
        const videoHeight = parseInt(styles.height, 10);
        const videoTop = parseInt(styles.top, 10);
        const videoLeft = parseInt(styles.left, 10);
        const frameDimensions = {width: videoWidth, height: videoHeight, top: videoTop, left: videoLeft};

        return frameDimensions;
    }
        /**
         * Component rendering the dotted frame around the media being focused on. 
         * Sets the frame's dimensions to be equal to the dimensions of the media on the webpage
         *
         * 
         * return (
         *   <Frame />
         * )
         */
    function renderResizeable() {
            const video = extractionFocus;
            if (video === undefined || video.current === null) {
                return null;
            }

            const styles = window.getComputedStyle(video);
            

            const videoWidth = parseInt(styles.width, 10);
            const videoHeight = parseInt(styles.height, 10);
            const videoTop = parseInt(styles.top, 10);
            const videoLeft = parseInt(styles.left, 10);
            const parentDimensions = {width: videoWidth, height: videoHeight, top: videoTop, left: videoLeft};
            return (
                <Frame processFSMRef = {processFSMRef} processFSMState = {processFSMState}
                frameDimensions = {frameDimensions} setFrameDimensions = {setFrameDimensions}
                frameRef = {resizeableRef} bottomRightCornerRef = {bottomRightCornerRef} topLeftCornerRef = {topLeftCornerRef} centerFrameRef = {centerFrameRef}
                parentDimensions = {parentDimensions}/>
            )
    }


    /**
    * Draws the current frame of an image/video onto the canvas object of the App based on the dimensions of the Dotted frame around the media
    * @return canvas
    */
    function drawCanvas(ref) {
        const resizeableElement = resizeableRef.current; // A Frame around which the image is drawn into the canvas
        const canvas = ref || canvasRef.current;
    
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
        const resizeableElementStyle = frameDimensions;
        const focusStyle = getComputedStyle(extractionFocus);
        const resizeableTop = frameDimensions.top
        const focusTop = parseInt(focusStyle.top, 10);
        const resizeableLeft = frameDimensions.left;
        const focusLeft = parseInt(focusStyle.left, 10);
        const resizeableWidth = frameDimensions.width;
        const resizeableHeight = frameDimensions.height;
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

        //ctx.strokeStyle = 'black';
        //ctx.lineWidth = 20;
        //ctx.strokeRect(0, 0, destinationWidth, destinationHeight);

        return canvas;
    }

    function AddBorderAndPaddingToCanvasImage() {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const originalCanvasWidth = canvas.width;
        const originalCanvasHeight = canvas.height;

        const imageData = ctx.getImageData(0, 0, originalCanvasWidth, originalCanvasHeight);

        const TOP_PADDING = 10;
        const LEFT_PADDING = 10;

        const newCanvasWidth = originalCanvasWidth + LEFT_PADDING * 2
        const newCanvasHeight = originalCanvasHeight + TOP_PADDING * 2
        canvas.width = newCanvasWidth
        canvas.height = newCanvasHeight

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, newCanvasWidth, newCanvasHeight)
        ctx.putImageData(imageData, LEFT_PADDING, TOP_PADDING)

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 10;
        ctx.strokeRect(0, 0, newCanvasWidth, newCanvasHeight);
    }

    async function extractTextFromCanvas(rectangles, psmMode, language, isNumericalExtraction) {
        const extractionLanguage = language || "eng";
        console.log(extractionLanguage)
        return await helperExtractText(canvasRef.current, rectangles, psmMode, extractionLanguage, props.setExtractionLog, isNumericalExtraction);
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

    async function extractText(numericalValues) {
        const video = extractionFocus;
        const canvas = canvasRef.current;
        const resizeableElement = resizeableRef.current;
        drawCanvas();
        AddBorderAndPaddingToCanvasImage();
        //const ctx = canvas.getContext("2d");
        //const avgPixelBrightness = getAveragePixelBrightness(ctx);
        //turnImageBinary(ctx, avgPixelBrightness);
        const canvasStyle = getComputedStyle(canvas);
        
        const canvasWidth = parseInt(canvasStyle.width, 10);
        // The "width" property for a canvas refers to the actually image it stores, not the size of the html object
        const canvasImageWidth = canvas.width; 

        const canvasToImageScaling = canvasImageWidth / canvasWidth;
        console.log("Scaling: " + canvasToImageScaling);
        
        const videoStyle = getComputedStyle(video);
        //const resizeableElementStyle = getComputedStyle(resizeableElement)
        const resizeableTop = frameDimensions.top;
        const resizeableLeft = frameDimensions.left;
        const videoTop = parseInt(videoStyle.top, 10);
        const videoLeft = parseInt(videoStyle.left, 10); 
        const resizeableWidth = frameDimensions.width;
        const resizeableHeight = frameDimensions.height;
    
        const rectangleTop = resizeableTop - videoTop;
        const rectangleLeft = resizeableLeft - videoLeft;
    
        const rectangle = {left: rectangleLeft * canvasToImageScaling,
                          top: rectangleTop * canvasToImageScaling,
                          width: resizeableWidth  * canvasToImageScaling,
                          height: resizeableHeight  * canvasToImageScaling};
        console.log(rectangle);

        const showNumericalValues = numericalValues || false;
        /** 
        if (showNumericalValues) {
            console.log("Showing Numerical Values")
            var myCanvas = document.getElementById("myCanvas");
            var ctx = myCanvas.getContext("2d");
            ctx.font = "250px Arial";
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 1920, 1080);
            ctx.fillStyle = 'black';
            ctx.fillText("3.5e2", 50, 500); 

            
        }
        */
        let PSM_MODE
        
        if (showNumericalValues) {
            PSM_MODE = PSM.SINGLE_LINE;
        }else {
            PSM_MODE = PSM.SINGLE_COLUMN;
        }
        console.log(`PSM Mode: ${PSM_MODE}`);
        let textValues = await extractTextFromCanvas([rectangle], PSM_MODE, extractionLanguage, showNumericalValues);

        if (showNumericalValues) {textValues = convertToStandardNotation(textValues);}
        
        console.log(`Converted Text Values: ${textValues}`);
        const extractedText = textValues[0];
        
        return extractedText;
    }

    async function extractTable(numericalValues) {
        const showNumericalValues = numericalValues || false;
        const canvas = canvasRef.current;
        
        drawCanvas();
        const [rectangles, numRows, numCols] = formRectanglesFromImage();
        let textValues = await extractTextFromCanvas(rectangles, PSM.SINGLE_COLUMN, extractionLanguage, showNumericalValues);

        if (showNumericalValues) {

            textValues = convertToStandardNotation(textValues);
        }

        const table = Table.textArrayToTable(textValues, numRows, numCols);

        return table;
    }
    
    function onExit() {
        const processFSM = processFSMRef.current;
        console.log(processFSM);
        processFSM.dispatch("reset");

        props.setShowAppMenu(false);
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


    function onTextAreaChange(e) {
        props.setExtractedText(e.target.value);
    }


    function changeFocus(e) {
        const element = e.target;
        if (element.tagName === "VIDEO" || element.tagName === "IMG") {
            props.setExtractionFocus(e.target);
            console.log("click");
            document.ondblclick = null;
            const el = document.querySelector('video');
            el.controls = true; // Renables menu for video players
        }
    }

    // New functions

    function onChangeExtractionFocus() {
        const processFSM = processFSMRef.current;
        processFSM.dispatch("changeExtractionFocus");
        props.setProcessFSMState(processFSM.state);
        
        /** 
        document.ondblclick = changeFocus
        const el = document.querySelector('video');
        el.controls = false; // Disables menu for video players so they can be clicked on to switch extraction target
        */
    }

    function onAdjustFrame() {
        const processFSM = processFSMRef.current;
        processFSM.dispatch("changeFrameAdjustment");
        props.setProcessFSMState(processFSM.state);
    }

    function onExtractText() {
        const processFSM = processFSMRef.current;
        processFSM.dispatch("extractText");
        props.setProcessFSMState(processFSM.state);
    }

    function onScreenshot() {
        const processFSM = processFSMRef.current;
        processFSM.dispatch("screenshot");
        props.setProcessFSMState(processFSM.state);

        //drawCanvas(previewCanvasRef);
    }
    
    function onTakeScreenshot() {
        const processFSM = processFSMRef.current;
        processFSM.dispatch("takeScreenshot");
        props.setProcessFSMState(processFSM.state);

        const canvas = canvasRef.current;
        drawCanvas();

        const canvasUrl = canvas.toDataURL("image/png", 0.5);
        const createEl = document.createElement('a');
        createEl.href = canvasUrl;
        createEl.download = "frame";
        createEl.click();
        createEl.remove();
    }

    function onReadjustFrame() {
        const processFSM = processFSMRef.current;
        processFSM.dispatch("adjustFrame");
        props.setProcessFSMState(processFSM.state);
        // Update screenshot
    }

    function onNewOperation() {
        const processFSM = processFSMRef.current;
        processFSM.dispatch("runNewOperation");
        props.setProcessFSMState(processFSM.state);
        
    }

    function onRepeatOperation() {
        const processFSM = processFSMRef.current;
        processFSM.dispatch("repeatOperation");
        props.setProcessFSMState(processFSM.state);
    }

    function onExtractTextAsTable() {
        const processFSM = processFSMRef.current;

        processFSM.dispatch("extractAsTable");
        props.setProcessFSMState(processFSM.state);
    }

    function onExtractTextFromFrame() {
        const processFSM = processFSMRef.current;
        processFSM.dispatch("extractAsFrame");
        props.setProcessFSMState(processFSM.state);
    }

    async function onExtractAsRegularText() {
        const processFSM = processFSMRef.current;

        const isNumericalText = false;
        const extractedText = await extractText(isNumericalText);
        props.setExtractedText(extractedText);

        processFSM.dispatch("extractAsRegularText");
        props.setProcessFSMState(processFSM.state);
    }

    async function onExtractAsRegularTable() {
        const processFSM = processFSMRef.current;

        const isNumericalTable = false
        const extractedTable = await extractTable(isNumericalTable);
        props.setExtractedTable(extractedTable);

        processFSM.dispatch("extractAsRegularTable");
        props.setProcessFSMState(processFSM.state);
    }

    async function onExtractAsNumericalTable() {
        const processFSM = processFSMRef.current;

        const isNumericalTable = true
        const extractedTable = await extractTable(isNumericalTable );
        props.setExtractedText(extractedTable);

        processFSM.dispatch("extractAsNumericalTable");
        props.setProcessFSMState(processFSM.state);
    }

    async function onExtractAsNumericalText() {
        const processFSM = processFSMRef.current;

        const isNumericalText = true
        const extractedText = await extractText(isNumericalText);
        props.setExtractedText(extractedText);

        processFSM.dispatch("extractAsNumericalText");
        props.setProcessFSMState(processFSM.state);
    }

    function onConfirm() {
        const processFSM = processFSMRef.current;
        processFSM.dispatch("confirm");
        props.setProcessFSMState(processFSM.state);
    }

    function onNext() {
        const processFSM = processFSMRef.current;
        processFSM.dispatch("next");
        props.setProcessFSMState(processFSM.state);
    }
    function onBack() {
        const processFSM = processFSMRef.current;
        processFSM.dispatch("back");
        props.setProcessFSMState(processFSM.state);
    }

    return (
        <Fragment data-testid = "AppMenu">
            <div id = "Menu" ref={props.optionSelectRef}>
                <div id = "Heading">
                    <h1> Option Select </h1>
                    
                </div>

                <div id = "Exit">
                    <button onClick = {onExit}> Exit </button> 
                </div>

                <div id = "Options">

                    {processFSMRef.current.state === "EXTRACTION_FOCUS" &&
                        <Fragment>
                            <button onClick = {onChangeExtractionFocus}> Change Extraction Focus </button>
                            
                        </Fragment>
                    }

                    {processFSMRef.current.state === "FRAME" &&
                        <Fragment>
                            <button onClick={onAdjustFrame}> Adjust Frame </button>
                            
                        </Fragment>
                    }


                    {(processFSMRef.current.state === "SELECT_PROCEDURE") &&
                        <Fragment>
                            <button onClick={onExtractText}> Extract Text </button>
                            <button onClick={onScreenshot}> Screenshot </button>
                        </Fragment>
                    }

                    {(processFSMRef.current.state === "SCREENSHOT") &&
                        <Fragment>
                            <button onClick={onTakeScreenshot}> Take Screenshot </button> 
                            <button onClick={onReadjustFrame}> Adjust Frame </button> 
                        </Fragment>
                    }

                    {(processFSMRef.current.state === "RESULT") &&
                        <Fragment>
                            <button onClick={onNewOperation}> New Operation </button>
                            <button onClick={onRepeatOperation}> Repeat Operation On New Focus </button> 
                        </Fragment>
                    }

                    {(processFSMRef.current.state === "EXTRACT_TEXT") &&
                        <Fragment>
                            <button onClick={onExtractTextAsTable}> Extract Text as Table </button>
                            <button onClick={onExtractTextFromFrame}> Extract Text from Frame </button> 
                        </Fragment>
                    }

                    {(processFSMRef.current.state === "EXTRACT_FRAMED_TEXT") &&
                        <Fragment>
                            <button onClick={onExtractAsRegularText}> Extract As Regular Text </button>
                            <button onClick={onExtractAsNumericalText}> Extract As Numerical Text </button> 
                        </Fragment>
                    }

                    
                    {(processFSMRef.current.state === "EXTRACT_TABULAR_TEXT") &&
                        <Fragment>
                            <button onClick={onExtractAsRegularTable}> Extract As Regular Table </button>
                            <button onClick={onExtractAsNumericalTable}> Extract As Numerical Table </button> 
                        </Fragment>
                    }

                    {(processFSMRef.current.state === "READJUST_FRAME" || processFSMRef.current.state === "ADJUST_FRAME" 
                    || processFSMRef.current.state === "READJUST_FRAME" || processFSMRef.current.state === "CHANGE_EXTRACTION_FOCUS"
                    || processFSMRef.current.state === "CONFIRM_EXTRACTION_TEXT") &&
                        <button onClick={onConfirm}> Confirm </button> 
                    }

                    {(processFSMRef.current.state === "EXTRACTION_FOCUS" || processFSMRef.current.state === "FRAME") &&
                        <button onClick={onNext}> Next </button>
                    }
                    
                    {(processFSMRef.current.state !== "EXTRACTION_FOCUS" && processFSMRef.current.state !== "ADJUST_FRAME" && processFSMRef.current.state !== "READJUST_FRAME" &&
                        processFSMRef.current.state !== "CHANGE_EXTRACTION_FOCUS" && processFSMRef.current.state != "RESULT") &&
                        <button onClick={onBack}> Back </button>
                    }

                </div>

                <div id = "OutputPreview">
      
                    

                    {(processFSMRef.current.state === "CONFIRM_EXTRACTION_TEXT") &&
                        <textarea  onChange = {onTextAreaChange} value={props.extractedText}>  </textarea>
                    }

                    {(processFSMRef.current.state === "EXTRACTING_TEXT" || processFSMRef.current.state === "EXTRACTING_TABLE") &&
                        <Fragment>
                            <h2> {extractionLog.status} </h2>
                            <progress value = {extractionLog.progress} max = "1"/>
                        </Fragment>
                    }

                    {(processFSMRef.current.state === "SELECT_TABLE_EXTRACTION_STYLE" || processFSMRef.current.state === "SELECT_TEXT_EXTRACTION_STYLE") &&
                        <Fragment>
                            <label htmlFor="language">Language Setting:</label>
                            <input list="languages" name="language" id="browser"/>
                            <datalist id="languages">
                                <option value="chi_sim">Chinese - Simplified</option>
                                <option value="eng">English</option>
                                <option value="fra">France</option>
                                <option value="spa">Spanish</option>
                                <option value="por">Portuguese</option>
                            </datalist>
                        </Fragment>
                    }
                </div>


                
            </div>
                
            {(processFSMRef.current.state === "CHANGE_EXTRACTION_FOCUS" || processFSMRef.current.state === "EXTRACTION_FOCUS" ||
             processFSMRef.current.state === "READJUST_FRAME" || processFSMRef.current.state === "ADJUST_FRAME" || processFSMRef.current.state === "FRAME") &&
                renderResizeable()};

        </Fragment>
    )
}