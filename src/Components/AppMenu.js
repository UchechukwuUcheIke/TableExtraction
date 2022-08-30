import { useRef, useState, Fragment,  } from 'react';
import { Resizeable, GlassPane } from './Resizeable';
import { DropDownList } from './DropDownList';
import { Frame } from "./Frame.js"
import './AppMenu.css';
import { Table } from './EdgeTextExtraction.mjs';
const { PSM } = require("tesseract.js");

export const machine = {
    state: 'START',
    transitions: {
        START: {
            extractTable() {
                this.state = 'SELECT_TABLE_EXTRACTION_STYLE'
            },
            saveFrame() {
                this.state = 'SAVING_FRAME_IMAGE'
            },
            extractText() {
                this.state = 'SELECT_TEXT_EXTRACTION_STYLE'
            },
            reset() {
                this.state = "START";
            }
        },
        SELECT_TABLE_EXTRACTION_STYLE: {
            extractAsNormal() {
                this.state = 'EXTRACTING_TABLE_AS_NORMAL';
            },
            extractAsNumerical() {
                this.state = 'EXTRACTING_TABLE_AS_NUMERICAL';
            },
            cancel() {
                this.state = 'START'
            },
            reset() {
                this.state = "START";
            }
        },
        EXTRACTING_TABLE_AS_NORMAL: {
            finishExtractingTable() {
                this.state = 'SELECT_TABLE_FORMAT';
            },
            cancel() {
                this.state = 'START'
            },
            reset() {
                this.state = "START";
            }
        },
        EXTRACTING_TABLE_AS_NUMERICAL: {
            finishExtractingTable() {
                this.state = 'SELECT_TABLE_FORMAT';
            },
            cancel() {
                this.state = 'START'
            },
            reset() {
                this.state = "START";
            }
        },
        SELECT_TABLE_FORMAT: {
            finishTableFormatting() {
                this.state = 'FINISH_TABLE_FORMATTING';
            },
            cancel() {
                this.state = 'START'
            },
            reset() {
                this.state = "START";
            }
        },
        SAVING_FRAME_IMAGE: {
            reset() {
                this.state = "START"
            },
            cancel() {
                this.state = 'START'
            },
            reset() {
                this.state = "START";
            }
        },
        SELECT_TEXT_EXTRACTION_STYLE: {
            extractAsNormal() {
                this.state = 'EXTRACTING_TEXT_AS_NORMAL';
            },
            extractAsNumerical() {
                this.state = 'EXTRACTING_TEXT_AS_NUMERICAL';
            },
            cancel() {
                this.state = 'START'
            },
            reset() {
                this.state = "START";
            }
        },
        EXTRACTING_TEXT_AS_NORMAL: {
            finishExtractingText() {
                this.state = 'FINISH_TEXT_EXTRACTION';
            },
            cancel() {
                this.state = 'START'
            },
            reset() {
                this.state = "START";
            }
        },
        EXTRACTING_TEXT_AS_NUMERICAL: {
            finishExtractingText() {
                this.state = 'FINISH_TEXT_EXTRACTION';
            },
            cancel() {
                this.state = 'START'
            },
            reset() {
                this.state = "START";
            }
        },
        FINISH_TEXT_EXTRACTION: {
            reset() {
                this.state = "START";
            }
        },
        FINISH_TABLE_FORMATTING: {
            reset() {
                this.state = "START";
            },
            finishTableFormatting() {
                this.state = "FINISH_TABLE_FORMATTING"
            }
        },

    },
    dispatch(actionName) {
        const action = this.transitions[this.state][actionName];

        if (action) {
            return action.call(this);
        } else {
            console.log('invalid action');
            return null;
        }
    },
};

function convertToStandardNotation(textValues) {
    const length = textValues.length;
    const result = new Array(length);

    for (let i = 0; i < textValues.length; i++) {
        const text = textValues[i];
        const textLength = text.length;
        const exponentIdx = text.indexOf("e");
        const coefficient = text.slice(0, exponentIdx);
        const exponent = text.slice(exponentIdx + 1, textLength);
        console.log(coefficient);
        console.log(exponent);
        if (exponent === "" || coefficient === "") { // Can't convert this, just return the old text value
            result[i] = text;
        } else {
            const coefficentValue = parseFloat(coefficient, 10);
            const exponentValue = parseFloat(exponent, 10);
            const value = coefficentValue * (10 ** exponentValue);
            console.log(value);
            result[i] = value.toString();
        }
    }

    return result;
}

function renderResizeable(resizeableRef, videoRef) {
    const video = videoRef;
    if (video === null) {
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
        <Frame frameRef = {resizeableRef} 
        parentDimensions = {parentDimensions}/>
    )
}

export function Menu(props) {
    const processFSMRef = useRef(Object.create(machine));
    const videoRef = props.videoRef;
    const canvasRef = props.canvasRef;
    const resizeableRef = props.resizeableRef;
    const extractionLog = props.extractionLog;
    const jsonCheckboxRef = useRef(null);
    const [extractionLanguage, setExtractionLanguage] = useState("eng")


    function onScreenshot() {
        const canvas  = canvasRef.current;

        props.drawCanvas(canvas);
    }

    async function extractText(numericalValues) {
        const video = videoRef;
        const canvas = canvasRef.current;
        const resizeableElement = resizeableRef.current;
        props.drawCanvas(canvas);
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
        let PSM_MODE = PSM.SPARSE_TEXT;
        console.log(`PSM Mode: ${PSM_MODE}`);
        let textValues = await props.extractText([rectangle], PSM_MODE, extractionLanguage);

        if (showNumericalValues) {textValues = convertToStandardNotation(textValues);}
        
        console.log(`Converted Text Values: ${textValues}`);
        const extractedText = textValues[0];
        
        return extractedText;
    }

    async function extractTable(numericalValues) {
        const showNumericalValues = numericalValues || false;
        const canvas = canvasRef.current;
        
        props.drawCanvas(canvas);
        const [rectangles, numRows, numCols] = props.formRectanglesFromImage();
        let textValues = await props.extractText(rectangles, PSM.SINGLE_COLUMN, extractionLanguage);

        if (showNumericalValues) {

            textValues = convertToStandardNotation(textValues);
        }

        const table = Table.textArrayToTable(textValues, numRows, numCols);

        return table;
    }
    

    async function onExtractAsText() {
        const processFSM = processFSMRef.current;

        if (processFSM.state !== "START" || videoRef == null) {
            return;
        }

        processFSM.dispatch("extractText");
        props.setExtractedText("TBD");

    }

    async function onExtractAsTable() {
        const processFSM = processFSMRef.current;

        if (processFSM.state !== "START" || videoRef == null) {
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
        props.drawCanvas(canvas);

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

        props.setAppMenuDisplay("none");
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
        props.setExtractionFocus(e.target);
        console.log("click");
        document.ondblclick = null;
        const el = document.querySelector('video');
        el.controls = true;
    }
    function onChangeExtractionTarget(e) {
        document.ondblclick = changeFocus
        const el = document.querySelector('video');
        el.controls = false;
    }

    return (
        <Fragment>
            <div id = "Menu">
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

                    <label htmlFor="language">Language Setting:</label>
                    <input list="languages" name="language" id="browser" onChange={onLanguageInputChange} />
                    <datalist id="languages">
                        <option value="chi_sim">Chinese - Simplified</option>
                        <option value="eng">English</option>
                        <option value="fra">France</option>
                        <option value="spa">Spanish</option>
                        <option value="por">Portuguese</option>
                    </datalist>
                </div>


                
            </div>

            {renderResizeable(resizeableRef, videoRef)};

        </Fragment>
    )
}
/** 
<Resizeable theRef = {resizeableRef} width={425} height={canvasHeight} 
minXPosition={0} maxXPosition={425} minYPosition={0} maxYPosition={450}/>
*/