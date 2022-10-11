import React, { useReducer, useEffect, useState, useRef, Fragment } from 'react';
import { ContextMenu } from './Components/ContextMenu';
import { Menu } from './Components/AppMenu';
import { parse } from 'url';
import { AppFSMConstructor } from './HelperClasses/helper';

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
  const CHANGE_EXTRACTION_FOCUS_KEY = "KeyF";
  const TOGGLE_APP_MENU_KEY = "KeyE";
  const SWAP_CORNER_KEY = "KeyR";
  
  const canvasRef = useRef(null); // Ref for the canvas object where 
  const resizeableRef = useRef(null); // Ref for resizeable frame around video
  const menuRef = useRef(null);
  const bottomRightCornerRef = useRef(null);
  const topLeftCornerRef = useRef(null);
  const centerFrameRef = useRef(null);
  const extractionCornerRef = useRef(topLeftCornerRef);

  const refsTable = {MENU: menuRef, FRAME: resizeableRef, LEFT_FRAME_CORNER: topLeftCornerRef, CENTER_FRAME: centerFrameRef, RIGHT_FRAME_CORNER: bottomRightCornerRef};
  const AppFSM = useRef(AppFSMConstructor(refsTable));

  let appMenuVisible = false // Keeps track of appMenu's visibility only for the useEffect callback

  let focusIndex = useRef(0); // Index for what extraction object to focus on. Is a ref so it is static between rerenders
  
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []); // This is an antipattern atm uche, think of a way to get rid of this

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
    function swapExtractionCorner(event) {
      if (event.repeat) {return}
  
      if (event.code === SWAP_CORNER_KEY) {
        if (extractionCornerRef.current === topLeftCornerRef) {
          extractionCornerRef.current = bottomRightCornerRef;
        } else if (extractionCornerRef.current === bottomRightCornerRef) {
          extractionCornerRef.current = topLeftCornerRef;
        }
        console.log(extractionCornerRef.current);
      }

      bottomRightCornerRef.current.style.backgroundColor = "white";
      topLeftCornerRef.current.style.backgroundColor = "white";
      extractionCornerRef.current.current.style.backgroundColor = "red";
    }

    function moveExtractionCorner(event) {
      console.log(extractionFocus);
      if (event.repeat) { return}

      const frame = resizeableRef.current;
      const frameStyles = window.getComputedStyle(frame);
      const extractionFocusStyles = window.getComputedStyle(extractionFocus);

      const MAX_PIXEL_INCREMENT = 10;

      if (event.code === "KeyA") {
        const width = parseInt(frameStyles.width, 10);
        if (extractionCornerRef.current === topLeftCornerRef) {
          const left = parseInt(frameStyles.left, 10);
          const minLeft = parseInt(extractionFocusStyles.left, 10);
          if ((left - MAX_PIXEL_INCREMENT) < minLeft) {
            return;
          }
          const right = frameStyles.right;
          
          frame.style.left = null;
          frame.style.right = right;
          frame.style.width = `${width  + MAX_PIXEL_INCREMENT}px`;

        } else if (extractionCornerRef.current === bottomRightCornerRef) {
          const left = frameStyles.left;
          
          frame.style.left = left;
          frame.style.right = null;
          frame.style.width = `${width  - MAX_PIXEL_INCREMENT}px`;

        }
      } else if (event.code === "KeyD") {
        const width = parseInt(frameStyles.width, 10);
        if (extractionCornerRef.current === topLeftCornerRef) {
          const right = frameStyles.right;
          
          frame.style.left = null;
          frame.style.right = right;
          frame.style.width = `${width  - MAX_PIXEL_INCREMENT}px`;

        } else if (extractionCornerRef.current === bottomRightCornerRef) {
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
        if (extractionCornerRef.current === topLeftCornerRef) {
          const bottom = frameStyles.bottom;
          
          frame.style.top = null;
          frame.style.bottom = bottom;
          frame.style.height = `${height  - MAX_PIXEL_INCREMENT}px`;

        } else if (extractionCornerRef.current === bottomRightCornerRef) {
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
        if (extractionCornerRef.current === topLeftCornerRef) {
          const top = parseInt(frameStyles.top, 10);
          const maxTop = parseInt(extractionFocusStyles.top, 10);
          if ((top - MAX_PIXEL_INCREMENT) < maxTop) {
            return;
          }
          const bottom = frameStyles.bottom;
          
          frame.style.top = null;
          frame.style.bottom = bottom;
          frame.style.height = `${height  + MAX_PIXEL_INCREMENT}px`;

        } else if (extractionCornerRef.current === bottomRightCornerRef) {
          const top = frameStyles.top;
          
          frame.style.top = top;
          frame.style.bottom = null;
          frame.style.height = `${height  - MAX_PIXEL_INCREMENT}px`;

        }
      }
    }

    console.log("Also HERE!");
    document.addEventListener("keydown", swapExtractionCorner);
    document.addEventListener("keydown", moveExtractionCorner);

    return () => {
      document.removeEventListener("keydown", moveExtractionCorner);
      document.removeEventListener("keydown", swapExtractionCorner);
    };
  }, [extractionFocus]);


  useEffect(()=>{
  
    function changeExtractionFocusOnKeyDown(event) {
      if (event.repeat) { return }
      
      if (event.code === CHANGE_EXTRACTION_FOCUS_KEY) {
        changeExtractionFocus()
      }
    }

    function toggleAppMenu(event) {
      if (event.repeat) {return}
  
      if (event.code === TOGGLE_APP_MENU_KEY) {
        
        if (appMenuVisible === false) {
          console.log("Toggled On");
          appMenuVisible = !appMenuVisible;
          setShowAppMenu(true);
          forceUpdate();
          console.log(showAppMenu);
        } else {
          console.log("Toggled Off");
          appMenuVisible = !appMenuVisible;
          setShowAppMenu(false);
          setShowContextMenu(false);
          forceUpdate();
        }
      }
    }

    

    function test(event) {
      console.log(event.code);
    }
    
    document.addEventListener("keydown", test);


    changeExtractionFocus();
    document.addEventListener("keydown", changeExtractionFocusOnKeyDown);
    document.addEventListener("keydown", toggleAppMenu);

    return () => {
      document.removeEventListener("keydown", changeExtractionFocusOnKeyDown);
      document.removeEventListener("keydown", toggleAppMenu);

      document.removeEventListener("keydown", test);
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
       ref={menuRef}
       extractedText = {extractedText} setExtractedText = {setExtractedText}
       extractedTable = {extractedTable} setExtractedTable = {setExtractedTable} extractionLog = {extractionLog} setExtractionLog = {setExtractionLog}
       canvasRef={canvasRef}
       setShowAppMenu={setShowAppMenu}
       resizeableRef={resizeableRef} bottomRightCornerRef = {bottomRightCornerRef} topLeftCornerRef = {topLeftCornerRef}
       extractionFocus = {extractionFocus} setExtractionFocus={setExtractionFocus}/>}
      

      <canvas id = "canvas" ref={canvasRef} width="1920" height="1080"  style={{"left": "1000px","top": "10px",
                                                    "width": "800px", "height": "450px"}} />

      
    </Fragment>
  );
} 
