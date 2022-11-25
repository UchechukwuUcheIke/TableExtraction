import React, { useReducer, useCallback, useEffect, useState, useRef, Fragment } from 'react';
import { ContextMenu } from './Components/ContextMenu';
import { Menu } from './Components/AppMenu';
import { parse } from 'url';
import { AppFSMConstructor, machine } from './HelperClasses/helper';

// ========================================


/**
 * Component holding all parts of the extraction app
 *
 * @component
 * @example
 * 
 * 
 * return (
 *   <ContextMenu>
 *   <AppMenu>
 *   <Resizeable>
 *   <Canvas>
 * )
 */
export function VideoApp() {
  const CHANGE_EXTRACTION_FOCUS_KEY = "Tab";
  
  const canvasRef = useRef(null); // Ref for the canvas object where 
  const resizeableRef = useRef(null); // Ref for resizeable frame around video
  const menuRef = useRef(null);
  const bottomRightCornerRef = useRef(null);
  const topLeftCornerRef = useRef(null);
  const centerFrameRef = useRef(null);
  const extractionCornerRef = useRef(topLeftCornerRef);
  const processFSMRef = useRef(Object.create(machine));
  const [processFSMState, setProcessFSMState] = useState(processFSMRef.current.state)

  //const [, updateState] = useState();
  //const forceUpdate = useCallback(() => updateState({}), []); // This is an antipattern atm uche, think of a way to get rid of this

  const refsTable = {MENU: menuRef, FRAME: resizeableRef, LEFT_FRAME_CORNER: topLeftCornerRef, CENTER_FRAME: centerFrameRef, RIGHT_FRAME_CORNER: bottomRightCornerRef};
  const appFSMRef = useRef(AppFSMConstructor(refsTable));

  let appMenuVisible = false // Keeps track of appMenu's visibility only for the useEffect callback

  let focusIndex = useRef(0); // Index for what extraction object to focus on. Is a ref so it is static between rerenders

  const [extractionLog, setExtractionLog] = useState(0);
  const [showAppMenu, setShowAppMenu] = useState(false);
  const [showContextMenu, setShowContextMenu ] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [extractedTable, setExtractedTable] = useState(null);
  const [extractionFocus, setExtractionFocus] = useState(null);

  const [ contextMenuTop, setContextMenuTop ] = useState(null);
  const [ contextMenuLeft, setContextMenuLeft ] = useState(null);

  const [ frameStyle, setFrameStyle ] = useState({});

  function changeExtractionFocus() {
    console.log("Focus changed");
    console.log(focusIndex.current);
    const potentialExtractionFoci = document.querySelectorAll('img, video');
    const mod = potentialExtractionFoci.length
    const newFocus = potentialExtractionFoci[focusIndex.current];
    setExtractionFocus(newFocus);

    focusIndex.current = (focusIndex.current + 1) % mod;
  }

  // Function is executed when user right clicks on page and pops up
  function toggleContextMenu(e) {
    e.preventDefault(); // Disables default right click option
    if (showContextMenu) {
      setShowContextMenu(false);
    } else {
      setShowContextMenu(true);
      setContextMenuTop(e.pageY + "px"); // Places context menu at mouse's current position
      setContextMenuLeft(e.pageX + "px");
    }

    const element = e.target;
    // if mouse is over a "media object" it immediately sets that object as the extraction focus
    if (element.tagName === "VIDEO" || element.tagName === "IMG") {setExtractionFocus(element);} 
  }

  useEffect(()=>{


    function moveExtractionCorner(event) {
      console.log(extractionFocus);
      if (event.repeat || (processFSMRef !== "ADJUST_FAME" && processFSMRef !== "READJUST_FRAME")) { return}

      const appFSM = appFSMRef.current;
      if (appFSM.state !== "LEFT_FRAME_CORNER" && appFSM.state !== "RIGHT_FRAME_CORNER") {
        return
      }
      
      const frame = resizeableRef.current;
      const frameStyles = window.getComputedStyle(frame);
      const extractionFocusStyles = window.getComputedStyle(extractionFocus);

      const MAX_PIXEL_INCREMENT = 10;

      if (event.code === "KeyA") {
        const width = parseInt(frameStyles.width, 10);
        if (appFSM.state == "LEFT_FRAME_CORNER") {
          const left = parseInt(frameStyles.left, 10);
          const minLeft = parseInt(extractionFocusStyles.left, 10);
          if ((left - MAX_PIXEL_INCREMENT) < minLeft) {
            return;
          }
          const right = frameStyles.right;
          
          frame.style.left = null;
          frame.style.right = right;
          frame.style.width = `${width  + MAX_PIXEL_INCREMENT}px`;

        } else if (appFSM.state == "RIGHT_FRAME_CORNER") {
          const left = frameStyles.left;
          
          frame.style.left = left;
          frame.style.right = null;
          frame.style.width = `${width  - MAX_PIXEL_INCREMENT}px`;

        }
      } else if (event.code === "KeyD") {
        const width = parseInt(frameStyles.width, 10);
        if (appFSM.state == "LEFT_FRAME_CORNER") {
          const right = frameStyles.right;
          
          frame.style.left = null;
          frame.style.right = right;
          frame.style.width = `${width  - MAX_PIXEL_INCREMENT}px`;

        } else if (appFSM.state == "RIGHT_FRAME_CORNER") {
          const right = parseInt(frameStyles.right, 10);
          const maxRight = parseInt(extractionFocusStyles.right, 10);
          if ((right + MAX_PIXEL_INCREMENT) < maxRight) {
            return;
          }
          const left = frameStyles.left;
          
          frame.style.left = left;
          frame.style.right = null;
          frame.style.width = `${width  + MAX_PIXEL_INCREMENT}px`;

        }
      } else if (event.code === "KeyS") {
        const height = parseInt(frameStyles.height, 10);
        if (appFSM.state == "LEFT_FRAME_CORNER") {
          const bottom = frameStyles.bottom;
          
          frame.style.top = null;
          frame.style.bottom = bottom;
          frame.style.height = `${height  - MAX_PIXEL_INCREMENT}px`;

        } else if (appFSM.state == "RIGHT_FRAME_CORNER") {
          const bottom = parseInt(frameStyles.bottom, 10);
          const maxBottom = parseInt(extractionFocusStyles.bottom, 10);
          if ((bottom + MAX_PIXEL_INCREMENT) < maxBottom) {
            return;
          }
          const top = frameStyles.top;

          frame.style.top = top;
          frame.style.bottom = null;
          frame.style.height = `${height  + MAX_PIXEL_INCREMENT}px`;

        }
      } else if (event.code === "KeyW") {
        const height = parseInt(frameStyles.height, 10);
        if (appFSM.state == "LEFT_FRAME_CORNER") {
          const top = parseInt(frameStyles.top, 10);
          const maxTop = parseInt(extractionFocusStyles.top, 10);
          if ((top - MAX_PIXEL_INCREMENT) < maxTop) {
            return;
          }
          const bottom = frameStyles.bottom;
          
          frame.style.top = null;
          frame.style.bottom = bottom;
          frame.style.height = `${height  + MAX_PIXEL_INCREMENT}px`;

        } else if (appFSM.state == "RIGHT_FRAME_CORNER") {
          const top = frameStyles.top;
          
          frame.style.top = top;
          frame.style.bottom = null;
          frame.style.height = `${height  - MAX_PIXEL_INCREMENT}px`;

        }
      }
    }

    console.log("Also HERE!");
    document.addEventListener("keydown", moveExtractionCorner);

    return () => {
    document.removeEventListener("keydown", moveExtractionCorner);
    };
  }, [extractionFocus]);


  useEffect(()=>{
  
    function changeExtractionFocusOnKeyDown(event) {
      if (event.repeat || processFSMRef.current.state !== "CHANGE_EXTRACTION_FOCUS") { return }
      if (event.code === CHANGE_EXTRACTION_FOCUS_KEY) {
        console.log("Changing focus");
        changeExtractionFocus()
      }
    }

    function toggleAppMenu() {
        
      if (appMenuVisible === false) {
          console.log("Toggled On");
          appMenuVisible = !appMenuVisible;
          setShowAppMenu(true);
          console.log(showAppMenu);
      } else {
          console.log("Toggled Off");
          appMenuVisible = !appMenuVisible;
          setShowAppMenu(false);
          setShowContextMenu(false);
      }
    }

    function ManipulateFSM(event) {
      const appFSM = appFSMRef.current
      const key = event.code;
      console.log(key);
  
      if (appFSM.ref != null) {
        const element = appFSM.ref.current;
        if (element != null) {
          element.style.outline = '#f00 solid 0px';

        }
      }
  
  
      if (key == "ArrowLeft") {
        appFSM.dispatch("left");
      } else if (key == "ArrowRight") {
        appFSM.dispatch("right");
      } else if (key == "Escape") {
        appFSM.dispatch("esc");
      } else if (key == "Enter") {
        appFSM.dispatch("enter");
      }
      console.log(appFSM.state);
  

      if (appFSM.state == "MENU" && appMenuVisible == false) {
        toggleAppMenu();
      }else if (appFSM.state == "APP_CLOSED" && appMenuVisible == true
      ) {
        toggleAppMenu();
      }

      
      if (appFSM.ref != null) {
        const element = appFSM.ref.current;
        if (element != null) {
          element.style.outline = '#f00 solid 2px';

        }
      }
    }
    
    document.addEventListener("keydown", ManipulateFSM);


    changeExtractionFocus();
    document.addEventListener("keydown", changeExtractionFocusOnKeyDown);
    //document.addEventListener("keydown", toggleAppMenu);

    return () => {
      document.removeEventListener("keydown", changeExtractionFocusOnKeyDown);
      //document.removeEventListener("keydown", toggleAppMenu);

      //document.removeEventListener("keydown", test);
    };
  }, []);




  function hideMenu() {
    setShowContextMenu(false);
  }

  document.onclick = hideMenu;
  document.oncontextmenu = toggleContextMenu;
  
  return (
    <Fragment>
      {showContextMenu &&
      <ContextMenu setExtractionFocus={setExtractionFocus} setShowAppMenu={setShowAppMenu}  setShowContextMenu={setShowContextMenu}
                    showContextMenu={showContextMenu} contextMenuTop={contextMenuTop} contextMenuLeft={contextMenuLeft}/>}

      {showAppMenu &&
      <Menu 
      processFSMRef = {processFSMRef} processFSMState = {processFSMState} setProcessFSMState = {setProcessFSMState}
       optionSelectRef={menuRef}
       extractedText = {extractedText} setExtractedText = {setExtractedText}
       extractedTable = {extractedTable} setExtractedTable = {setExtractedTable} extractionLog = {extractionLog} setExtractionLog = {setExtractionLog}
       canvasRef={canvasRef}
       setShowAppMenu={setShowAppMenu}
       resizeableRef={resizeableRef} bottomRightCornerRef = {bottomRightCornerRef} topLeftCornerRef = {topLeftCornerRef} centerFrameRef = {centerFrameRef}
       extractionFocus = {extractionFocus} setExtractionFocus={setExtractionFocus}/>}
      

      <canvas data-testid = "Canvas" id = "canvas" ref={canvasRef} width="1920" height="1080"  style={{"left": "1000px","top": "10px",
                                                    "width": "800px", "height": "450px"}} />

      
    </Fragment>
  );
} 
