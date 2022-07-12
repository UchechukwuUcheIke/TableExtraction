import { useRef, Fragment } from 'react';
import { Resizeable, GlassPane } from './Resizeable';
import './AppMenu.css';
import { Table } from './EdgeTextExtraction.mjs';
const { PSM } = require("tesseract.js");

export const machine = {
    state: 'START',
    transitions: {
        START: {
            extractTable() {
                this.state = 'EXTRACTING_TABLE'
            },
            saveFrame() {
                this.state = 'SAVING_FRAME_IMAGE'
            },
            extractText() {
                this.state = 'EXTRACTING_TEXT'
            },
            reset() {
                this.state = "START";
            }
        },
        EXTRACTING_TABLE: {
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
        EXTRACTING_TEXT: {
            finishTextExtraction() {
                this.state = 'FINISH_TEXT_EXTRACTION';
            },
            cancel() {
                this.state = 'START';
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

function renderResizeable(resizeableRef, videoRef) {
    const video = videoRef.current;
    if (video === null) {
        return null;
    }

    const styles = window.getComputedStyle(video);

    const width = styles.width;
    const height = styles.height;
    const minXPosition = styles.left;
    const maxXPosition = styles.right;
    const minYPosition = styles.top;
    const maxYPosition = styles.bottom;
    console.log(minXPosition)
    console.log(minYPosition)
    console.log(width)
    console.log(height)
    return (
        <Resizeable theRef = {resizeableRef} 
        resizeableStyle={{position: 'absolute', top: minYPosition, left: minXPosition, width:width, height: height}}
        minXPosition={minXPosition} maxXPosition={maxXPosition} minYPosition={minYPosition} maxYPosition={maxYPosition}/>
    )
}

export function Menu(props) {
    const processFSM = props.processFSM;
    const videoRef = props.videoRef;
    const canvasRef = props.canvasRef;
    const resizeableRef = props.resizeableRef;
    const extractionLog = props.extractionLog;
    const jsonCheckboxRef = useRef(null);


    function onScreenshot() {
        const canvas  = canvasRef.current;

        props.drawCanvas(canvas);
    }

    async function onScanAsText() {

        if (processFSM.state !== "START") {
            return;
        }

        processFSM.dispatch("extractText");
        let newProcessFSM = {state: processFSM.state,
            transitions: {
                ...processFSM.transitions
            },
            dispatch: processFSM.dispatch};
        props.setProcessFSM(newProcessFSM);

        const video = videoRef.current;
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

        const textValues = await props.extractText([rectangle], PSM.SINGLE_BLOCK)
        const extractedText = textValues[0];
        props.setExtractedText(extractedText);

        processFSM.dispatch("finishTextExtraction")
        newProcessFSM = {state: processFSM.state,
            transitions: {
                ...processFSM.transitions
            },
            dispatch: processFSM.dispatch};
        props.setProcessFSM(newProcessFSM);

        console.log(processFSM.state)
    }

    async function onScanAsTable() {
        if (processFSM.state !== "START") {
            return;
        }

        processFSM.dispatch("extractTable")
        let newProcessFSM = {state: processFSM.state,
            transitions: {
                ...processFSM.transitions
            },
            dispatch: processFSM.dispatch};
        props.setProcessFSM(newProcessFSM);
        console.log(processFSM);
        const canvas = canvasRef.current;
        props.drawCanvas(canvas);
        //FSM.dispatch("extractTable");
        //props.setProcessState(FSM.state);

        const [rectangles, numRows, numCols] = props.formRectanglesFromImage();

        const textValues = await props.extractText(rectangles, PSM.SINGLE_COLUMN);
        const table = Table.textArrayToTable(textValues, numRows, numCols);
        props.setExtractedTable(table);
        
        // Update FSM
        processFSM.dispatch("finishExtractingTable")
        newProcessFSM = {state: processFSM.state,
            transitions: {
                ...processFSM.transitions
            },
            dispatch: processFSM.dispatch};
        props.setProcessFSM(newProcessFSM);

        props.setExtractionLog({
            status: '',
            progress: 0,
        })
    }

    function onScanAsCSVTable() {
        let table = props.extractedTable;
        const extractedText = table.convertToCSV();
        props.setExtractedText(extractedText);
        
        // Update FSM
        console.log(processFSM);
        processFSM.dispatch("finishTableFormatting")
        const newProcessFSM = {...processFSM,
            transitions: {
                ...processFSM.transitions
            },
            ...processFSM.dispatch};
        props.setProcessFSM(newProcessFSM);

        console.log(processFSM.state)
    }

    function onScanAsHTMLTable() {
        //console.log(FSM.state)
        const table = props.extractedTable;
        const extractedText = table.convertToHTML();
        props.setExtractedText(extractedText);
        
        // Update FSM
        
        processFSM.dispatch("finishTableFormatting")
        const newProcessFSM = {state: processFSM.state,
            transitions: {
                ...processFSM.transitions
            },
            dispatch: processFSM.dispatch};
        props.setProcessFSM(newProcessFSM);
    }

    function onScanAsJSONTable() {
        //console.log(FSM.state)
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
        const newProcessFSM = {state: processFSM.state,
            transitions: {
                ...processFSM.transitions
            },
            dispatch: processFSM.dispatch};
        props.setProcessFSM(newProcessFSM);
    }

    function onSaveAsImage() {
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
        processFSM.dispatch("reset");
        const newProcessFSM = Object.assign({}, processFSM);
        props.setProcessFSM(newProcessFSM);
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
        processFSM.dispatch("cancel")
        const newProcessFSM = Object.assign({}, processFSM);
        props.setProcessFSM(newProcessFSM);
    }
    function onClearOperation() {
        processFSM.dispatch("reset");
        const newProcessFSM = Object.assign({}, processFSM);
        props.setProcessFSM(newProcessFSM);
    }

    function onTextAreaChange(e) {
        props.setExtractedText(e.target.value);
    }

    return (
        <Fragment>
            <div id = "Menu" style={{"display": props.display}}>
                <div id = "Heading">   
                    <h1> Option Select </h1>
                </div>

                <div id = "Exit">
                    <button onClick = {onExit}> Exit </button> 
                </div>

                <div id = "Options">

                    {processFSM.state === "START" &&
                        <Fragment>
                            <button onClick={onScanAsText}> Extract Text From Frame </button>
                            <button onClick={onScanAsTable}> Extract Text As Table </button>
                            <button onClick ={onSaveAsImage}> Save Frame as Image </button>
                        </Fragment>
                    }


                    {(processFSM.state === "SELECT_TABLE_FORMAT" || processFSM.state === "FINISH_TABLE_FORMATTING") &&
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

                    {processFSM.state !== "START" && processFSM.state !== "FINISH_TEXT_EXTRACTION" &&
                     processFSM.state !== "FINISH_TABLE_FORMATTING" &&
                        <button onClick={onCancelOperation}> Cancel </button>
                    }

                    {(processFSM.state === "FINISH_TEXT_EXTRACTION" || processFSM.state === "FINISH_TABLE_FORMATTING") &&
                        <Fragment>
                            <button onClick={onCopyTextToClipboard}> Copy Text To Clipboard </button>
                            <button onClick={onClearOperation}> Clear Operation </button> 
                        </Fragment>
                    }

                    {processFSM.state === "SAVING_FRAME_IMAGE" &&
                        <button onClick={onClearOperation}> Clear Operation </button> 
                    }

                </div>

                <div id = "OutputPreview">

                    {(processFSM.state === "FINISH_TABLE_FORMATTING" || processFSM.state === "FINISH_TEXT_EXTRACTION") &&
                        <textarea  onChange = {onTextAreaChange} value={props.extractedText}>  </textarea>
                    }

                    {(processFSM.state === "EXTRACTING_TEXT" || processFSM.state === "EXTRACTING_TABLE") &&
                        <Fragment>
                            <h2> {extractionLog.status} </h2>
                            <progress value = {extractionLog.progress} max = "1"/>
                        </Fragment>
                    }
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