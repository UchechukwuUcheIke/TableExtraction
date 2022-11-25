import React, { Fragment, useEffect, useRef } from 'react';
import './Frame.css';
export function Frame(props) {
    const frameRef = props.frameRef;
    const processFSMRef = props.processFSMRef;
    const processFSMState = props.processFSMState;

    const bottomRightCornerRef = props.bottomRightCornerRef;
    const topLeftCornerRef = props.topLeftCornerRef;

    const centerButtonRef = props.centerFrameRef;
    const parentDimensions = props.parentDimensions;

    const frameDimensions = props.frameDimensions;

    const frameTop = frameDimensions.top;
    const frameLeft = frameDimensions.left;
    const frameWidth = frameDimensions.width;
    const frameHeight = frameDimensions.height;

    const parentTop = parentDimensions.top;
    const parentLeft = parentDimensions.left;
    const parentWidth = parentDimensions.width;
    const parentHeight = parentDimensions.height;
    const parentRight = parentLeft + parentDimensions.width;
    const parentBottom = parentTop + parentDimensions.height;
    
  
    useEffect(() => {
      const frame = frameRef.current;
      let frameStyles = window.getComputedStyle(frame);
      const bottomRightCorner = bottomRightCornerRef.current;
      const topLeftCorner = topLeftCornerRef.current;
      const center = centerButtonRef.current;

  

  
      let width = parseInt(frameStyles.width, 10);
      let height = parseInt(frameStyles.height, 10)
      let x = 0;
      let y = 0;
  
      // Center Button
  
      function onCenterButtonClick(event) {
        frame.style.top = `${parentTop}px`;
        frame.style.left = `${parentLeft}px`;
        frame.style.width = `${parentWidth}px`
        frame.style.height = `${parentHeight}px`
      }
  
      function onMouseMoveCenterDrag(event) {
        let dx = event.clientX - x;
        let dy = event.clientY - y;
  
        x = event.clientX;
        y = event.clientY;
        
        frameStyles = window.getComputedStyle(frame);
        const frameTop = parseInt(frameStyles.top, 10);
        const frameLeft = parseInt(frameStyles.left, 10);
        const frameWidth = parseInt(frameStyles.width, 10);
        const frameHeight = parseInt(frameStyles.height, 10);
        const frameRight = frameLeft + frameWidth;
        const frameBottom = frameTop + frameHeight;
  
        if (dx < 0 && frameLeft + dx <= parentLeft) {
          dx = 0;
        } else if (dx > 0 && frameRight + dx >= parentRight) {
          dx = 0;
        }
  
        if (dy < 0 && frameTop + dy <= parentTop) {
          dy = 0;
        } else if (dy > 0 && frameBottom + dy >= parentBottom) {
          dy = 0;
        }
  
        const newTop = frameTop + dy;
        const newLeft = frameLeft + dx;
  
        frame.style.top = `${newTop}px`;
        frame.style.left = `${newLeft}px`;

        const newFrameDimensions = {width: frameDimensions.width, height: frameDimensions.height, top: newTop, left: newLeft};
        props.setFrameDimensions(newFrameDimensions);
      };
  
      function onMouseUpCenterDrop(event) {
        document.removeEventListener("mousemove", onMouseMoveCenterDrag)
      };
  
      function onMouseDownCenterPickup(event) {
        x = event.clientX;
        y = event.clientY;
        frameStyles = window.getComputedStyle(frame);
        document.addEventListener("mousemove", onMouseMoveCenterDrag);
        document.addEventListener("mouseup", onMouseUpCenterDrop);
      };
  
      // Top Left Corner
      function onMouseMoveTopLeftResize(event) {
        let dx = event.clientX - x;
        let dy = event.clientY - y;

        const buttonStyles = window.getComputedStyle(bottomRightCorner);
        const buttonWidth = parseInt(buttonStyles.width, 10);
  
        const frameStyles = window.getComputedStyle(frame);
        const frameLeft = parseInt(frameStyles.left, 10)
        const frameTop = parseInt(frameStyles.top, 10)
        if (dx < 0 && frameLeft + dx <= parentLeft) {
          dx = 0;
        }
        
        if (dy < 0 && frameTop + dy <= parentTop) {
          dy = 0;
        }

        x = event.clientX;
        width = width - dx;
        y = event.clientY;
        height = height - dy;
  
        frame.style.width = `${width}px`;
        frame.style.height = `${height}px`;

        const newFrameDimensions = {width: width, height: height, top: frameDimensions.top, left: frameDimensions.left};
        props.setFrameDimensions(newFrameDimensions);
      };
  
      function onMouseUpTopLeftResize(event) {
        document.removeEventListener("mousemove", onMouseMoveTopLeftResize)
      };
  
      function onMouseDownTopLeftResize(event) {
        x = event.clientX;
        y = event.clientY;
        const frameStyles = window.getComputedStyle(frame);
        frame.style.left = null;
        frame.style.top = null;
        frame.style.right = frameStyles.right;
        frame.style.bottom = frameStyles.bottom;
        document.addEventListener("mousemove", onMouseMoveTopLeftResize);
        document.addEventListener("mouseup", onMouseUpTopLeftResize);
      };
  
      
  
      // Bottom Right Corner
      function onMouseMoveBottomRightResize(event) {
        let dx = event.clientX - x;
        let dy = event.clientY - y;
  
        const frameStyles = window.getComputedStyle(frame);
        const frameLeft = parseInt(frameStyles.left, 10);
        const frameTop = parseInt(frameStyles.top, 10);
        const frameWidth = parseInt(frameStyles.width, 10);
        const frameHeight = parseInt(frameStyles.height, 10);
        const frameRight = frameLeft + frameWidth;
        const frameBottom = frameTop + frameHeight;
  
        console.log(`FrameRight: ${frameRight}`)
        console.log(`dx: ${dx}`)
        console.log(`parentRight: ${parentRight}`)
        if (dx > 0 && frameRight + dx > parentRight) {
          console.log(frameRight + dx >= parentRight)
          dx = 0;
        }
        if (dy > 0 && frameBottom + dy >= parentBottom) {
          console.log(frameRight + dx >= parentRight)
          dy = 0;
        }
  
        x = event.clientX;
        width = width + dx;
        y = event.clientY;
        height = height + dy;
  
        frame.style.width = `${width}px`;
        frame.style.height = `${height}px`;

        const newFrameDimensions = {width: width, height: height, top: frameDimensions.top, left: frameDimensions.left};
        props.setFrameDimensions(newFrameDimensions);
      };
  
      function onMouseUpBottomRightResize(event) {
        document.removeEventListener("mousemove", onMouseMoveBottomRightResize)
      };
  
      function onMouseDownBottomRightResize(event) {
        x = event.clientX;
        y = event.clientY;
        const frameStyles = window.getComputedStyle(frame);
        frame.style.left = frameStyles.left;
        frame.style.right = null;
        frame.style.top = frameStyles.top;
        frame.style.bottom = null;
        document.addEventListener("mousemove", onMouseMoveBottomRightResize);
        document.addEventListener("mouseup", onMouseUpBottomRightResize);
      };
      

      if (center) {
        center.addEventListener("mousedown", onMouseDownCenterPickup);
        center.addEventListener("dblclick", onCenterButtonClick);
      }

      if (topLeftCorner) {
        topLeftCorner.addEventListener("mousedown", onMouseDownTopLeftResize);
      }

      if (bottomRightCorner) {
        bottomRightCorner.addEventListener("mousedown", onMouseDownBottomRightResize);
      }
  
      return () => {
        if (center) {
          center.removeEventListener("mousedown", onMouseDownCenterPickup);
          center.removeEventListener("dblclick", onCenterButtonClick);
        }

        if (topLeftCorner) {
          topLeftCorner.removeEventListener("mousedown", onMouseDownTopLeftResize)
        }

        if (bottomRightCorner) {
          bottomRightCorner.removeEventListener("mousedown", onMouseDownBottomRightResize);
        }
        
      }
    }, [processFSMState])
    return (
      <div ref={frameRef} className = "frame" style={{"top": `${frameTop}px`, "left": `${frameLeft}px`,
                                                        "width": `${frameWidth}px`, "height": `${frameHeight}px`}}>

      {(processFSMRef.current.state === "READJUST_FRAME" || processFSMRef.current.state === "ADJUST_FRAME") &&
        <Fragment>                                               
          <button ref={bottomRightCornerRef} id="bottomRight" style={{"right": "0px", "bottom": "0px", "backgroundColor": "white"}}> </button>
          <button ref={topLeftCornerRef} id="topLeft" style={{"left": "0px", "top": "0px", "backgroundColor": "white"}}> </button>
          <button ref={centerButtonRef} id="center"> </button>
        </Fragment>  
      }
      </div>
    );
  }