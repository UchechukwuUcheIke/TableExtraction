import { useRef, useState, Fragment,  } from 'react';
import { Resizeable, GlassPane } from './Resizeable';
import { DropDownList } from './DropDownList';
import { Frame } from "./Frame.js"
import './AppMenu.css';
import { machine, convertToStandardNotation, Table } from '../HelperClasses/helper.js';
import { helperExtractText, getAveragePixelBrightness, turnImageBinary, convertCTXToColorArray, getColumnEdgeCount, getRowEdgeCount, getMode, getSubsections, getMinSubectionWidth } from './EdgeTextExtraction.js';
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
    const processFSMRef = useRef(Object.create(machine));
    const canvasRef = props.canvasRef; // Ref to the Canvas object where image extractions from media are stored
    const extractionFocus = props.extractionFocus // The image or video being drawn on the canvas
    const resizeableRef = props.resizeableRef; // Ref to the "Frame" around media
    const extractionLog = props.extractionLog; // REACT state referencing the current state of the extraction process according to Tesseract
    const jsonCheckboxRef = useRef(null);
    const [extractionLanguage, setExtractionLanguage] = useState("eng") // State for the extraction language of tesseract
    const bottomRightCornerRef = props.bottomRightCornerRef;
    const topLeftCornerRef = props.topLeftCornerRef;
    const centerFrameRef = props.centerFrameRef;
    
    const frameStyle = props.frameStyle;
    const setFrameStyle = props.setFrameStyle;

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
            console.log(parentDimensions);
            return (
                <Frame frameRef = {resizeableRef} bottomRightCornerRef = {bottomRightCornerRef} topLeftCornerRef = {topLeftCornerRef} centerFrameRef = {centerFrameRef}
                parentDimensions = {parentDimensions}/>
            )
    }


    /**
    * Draws the current frame of an image/video onto the canvas object of the App based on the dimensions of the Dotted frame around the media
    * @return canvas
    */
    function drawCanvas() {
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
        const resizeableElementStyle = getComputedStyle(resizeableElement)
        const resizeableTop = parseInt(resizeableElementStyle.top, 10);
        const resizeableLeft = parseInt(resizeableElementStyle.left, 10);
        const videoTop = parseInt(videoStyle.top, 10);
        const videoLeft = parseInt(videoStyle.left, 10); 
        const resizeableWidth = parseInt(resizeableElementStyle.width, 10);
        const resizeableHeight = parseInt(resizeableElementStyle.height, 10);
    
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
    

    async function onExtractAsText() {
        const processFSM = processFSMRef.current;

        if (processFSM.state !== "START" || extractionFocus == null) {
            return;
        }

        processFSM.dispatch("extractText");
        props.setExtractedText("TBD");

    }

    async function onExtractAsTable() {
        const processFSM = processFSMRef.current;

        if (processFSM.state !== "START" || extractionFocus == null) {
            return;
        }

        processFSM.dispatch("extractTable")
        props.setExtractedText("TBD");

        // Update FSM
        props.setExtractionLog({
            status: '',
            progress: 0,
        })
    }

    async function onExtractAsNormalTable() {
        const processFSM = processFSMRef.current;
        processFSM.dispatch("extractAsNormal");

        const table = await extractTable();
        props.setExtractedTable(table);
        
        processFSM.dispatch("finishExtractingTable");
    }

    async function onExtractAsNumericalTable() {
        const processFSM = processFSMRef.current;
        processFSM.dispatch("extractAsNormal");

        const table = await extractTable(true); 
        props.setExtractedTable(table);
        
        processFSM.dispatch("finishExtractingTable");
    }

    async function onExtractAsNormalText() {
        const processFSM = processFSMRef.current;
        processFSM.dispatch("extractAsNormal");

        const extractedText = await extractText();
        props.setExtractedText(extractedText);
        
        processFSM.dispatch("finishExtractingText")
    }

    async function onExtractAsNumericalText() {
        const processFSM = processFSMRef.current;
        processFSM.dispatch("extractAsNumerical");

        const extractedText = await extractText(true);
        props.setExtractedText(extractedText);
        
        processFSM.dispatch("finishExtractingText");
    }

    function onScanAsCSVTable() {
        const processFSM = processFSMRef.current;

        let table = props.extractedTable;
        console.log(table);
        const extractedText = table.convertToCSV();
        props.setExtractedText(extractedText);
        
        // Update FSM
        console.log(processFSM);
        processFSM.dispatch("finishTableFormatting")

        console.log(processFSM.state)
    }

    function onScanAsHTMLTable() {
        const processFSM = processFSMRef.current;

        //console.log(FSM.state)
        const table = props.extractedTable;
        console.log(table);
        const extractedText = table.convertToHTML();
        props.setExtractedText(extractedText);
        
        // Update FSM
        
        processFSM.dispatch("finishTableFormatting")

    }

    function onScanAsJSONTable() {
        //console.log(FSM.state)
        const processFSM = processFSMRef.current;
         
        let table = props.extractedTable;
        const checkbox = jsonCheckboxRef.current;

        if (checkbox.checked) {
            const newTable = new Table();
            newTable.loadTable(table.getContents());
            newTable.insertRow(0);

            for (let i = 0; i < newTable.getColumns(); i++) {
                newTable.insertItem(0, i, `Heading-${i + 1}`);
            }

            table = newTable;
        }

        const extractedText = table.convertToJSON();
        props.setExtractedText(extractedText);
        // Update FSM
        
        processFSM.dispatch("finishTableFormatting");

    }

    function onSaveAsImage() {
        const processFSM = processFSMRef.current;

        if (processFSM.state !== "START") {
            return;
        }

        const canvas = canvasRef.current;
        drawCanvas();

        const canvasUrl = canvas.toDataURL("image/png", 0.5);
        const createEl = document.createElement('a');
        createEl.href = canvasUrl;
        createEl.download = "frame";
        createEl.click();
        createEl.remove();
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

    function onCancelOperation() {
        const processFSM = processFSMRef.current;
        processFSM.dispatch("cancel")
        props.setExtractedText("");
    }
    function onClearOperation() {
        const processFSM = processFSMRef.current;
        processFSM.dispatch("reset");
        props.setExtractedText("");
    }

    function onTextAreaChange(e) {
        props.setExtractedText(e.target.value);
    }

    function onLanguageInputChange(e) {
        const language = e.target.value
        setExtractionLanguage(language);
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
    function onChangeExtractionTarget(e) {
        document.ondblclick = changeFocus
        const el = document.querySelector('video');
        el.controls = false; // Disables menu for video players so they can be clicked on to switch extraction target
    }

    return (
        <Fragment>
            <div id = "Menu" ref={props.optionSelectRef}>
                <div id = "Heading">
                    <h1> Option Select </h1>
                    
                </div>

                <div id = "Exit">
                    <button onClick = {onExit}> Exit </button> 
                </div>

                <div id = "Options">

                    {processFSMRef.current.state === "START" &&
                        <Fragment>
                            <button onClick={onExtractAsText}> Extract Text From Frame </button>
                            <button onClick={onExtractAsTable}> Extract Text As Table </button>
                            <button onClick ={onSaveAsImage}> Save Frame as Image </button>
                            <button onClick = {onChangeExtractionTarget}> Change Extraction Target </button>
                        </Fragment>
                    }

                    {processFSMRef.current.state === "SELECT_TABLE_EXTRACTION_STYLE" &&
                        <Fragment>
                            <button onClick={onExtractAsNormalTable} > Extract As Normal Table </button>
                            <button onClick={onExtractAsNumericalTable}> Extract As Numerical Table </button>
                        </Fragment>
                    }

                    {processFSMRef.current.state === "SELECT_TEXT_EXTRACTION_STYLE" &&
                        <Fragment>
                            <button onClick={onExtractAsNormalText}> Extract As Normal Text </button>
                            <button onClick={onExtractAsNumericalText}> Extract As Numerical Text </button>
                        </Fragment>
                    }


                    {(processFSMRef.current.state === "SELECT_TABLE_FORMAT" || processFSMRef.current.state === "FINISH_TABLE_FORMATTING") &&
                        <Fragment>
                            <button onClick={onScanAsHTMLTable}> Extract Text As HTML Table </button>
                            <button onClick={onScanAsCSVTable}> Extract Text As CSV Table </button>
                            <button onClick={onScanAsJSONTable}> Extract Text As JSON Table 
                                <input ref = {jsonCheckboxRef} type="checkbox" id="JSONAddHeadings"
                                 name="JSONAddHeadings" value="Add Headings"/>
                                <label htmlFor="JSONAddHeadings"> Add Default Headings </label>
                            </button>
                        </Fragment>
                    }

                    {processFSMRef.current.state !== "START" && processFSMRef.current.state !== "FINISH_TEXT_EXTRACTION" &&
                     processFSMRef.current.state !== "FINISH_TABLE_FORMATTING" &&
                        <button onClick={onCancelOperation}> Cancel </button>
                    }

                    {(processFSMRef.current.state === "FINISH_TEXT_EXTRACTION" || processFSMRef.current.state === "FINISH_TABLE_FORMATTING") &&
                        <Fragment>
                            <button onClick={onCopyTextToClipboard}> Copy Text To Clipboard </button>
                            <button onClick={onClearOperation}> Clear Operation </button> 
                        </Fragment>
                    }

                    {processFSMRef.current.state === "SAVING_FRAME_IMAGE" &&
                        <button onClick={onClearOperation}> Clear Operation </button> 
                    }

                </div>

                <div id = "OutputPreview">

                    {(processFSMRef.current.state === "FINISH_TABLE_FORMATTING" || processFSMRef.current.state === "FINISH_TEXT_EXTRACTION") &&
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
                            <input list="languages" name="language" id="browser" onChange={onLanguageInputChange} />
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

            {renderResizeable()};

        </Fragment>
    )
}