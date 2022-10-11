import { useState, useEffect, useRef } from 'react';
import "./Resizeable.css"
export function GlassPane() {
    const [ isDragging, setIsDragging ] = useState(false);
    const [ diffX, setDiffX ] = useState(0);
    const [ diffY, setDiffY ] = useState(0);
    const [ styles, setStyles ] = useState({top: 0, left: 0});
  
    function dragStart(e) {
      const newDiffX = e.screenX - e.currentTarget.getBoundingClientRect().left;
      const newDiffY = e.screenY - e.currentTarget.getBoundingClientRect().top;
  
      setDiffX(newDiffX);
      setDiffY(newDiffY);
      setIsDragging(true);
    }
  
    function dragEnd(e) {
      setIsDragging(false);
    }
  
    function dragging(e) {
  
      if (isDragging == false) {
        return;
      }
  
      const newLeft = e.screenX - diffX;
      const newTop = e.screenY - diffY;
  
      setStyles({left: newLeft, top:newTop});
    }
  
  
    return (
      <div id = "glass-pane" style = {styles} onMouseDown={dragStart} onDragOver={dragging} onMouseUp={dragEnd}> </div>
    );
  }
  
export function Resizeable(props) {
  const TOGGLE_CORNER_KEY = "KeyR";
  const minXPosition = props.minXPosition || 0;
  const minYPosition = props.minYPosition || 0;
  const maxXPosition = props.maxXPosition;
  const maxYPosition = props.maxYPosition;

    const refLeft = useRef(null);
    const refTop = useRef(null);
    const refRight = useRef(null);
    const refBottom = useRef(null);
    const frameStyle = props.frameStyle;
    const setFrameStyle = props.setFrameStyle;
  
    useEffect(() => {
      const resizeableEle = props.theRef.current;
      const styles = window.getComputedStyle(resizeableEle);
      let width = parseInt(styles.width, 10);
      let height = parseInt(styles.height, 10);
      let x = 0;
      let y = 0;
      
      // Right resize
      const onMouseMoveRightResize = (event) => {
        //const styles = window.getComputedStyle(resizeableEle);
        let right = parseInt(frameStyle.right, 10);
        console.log(right);
        const dx = event.clientX - x;

        if ((right < minXPosition && dx > 0) || (right > maxXPosition && dx < 0)){
          return;
        }

        x = event.clientX;

        width = width + dx;
        //resizeableEle.style.width = `${width}px`;
        setFrameStyle({"left": frameStyle.left,"top": frameStyle.top, "width": `${width}px`, "height": frameStyle.height, "right": frameStyle.right, "bottom": frameStyle.bottom});
        
      };
  
      const onMouseUpRightResize = (event) => {
        document.removeEventListener("mousemove", onMouseMoveRightResize);
      };
  
      const onMouseDownRightResize = (event) => {
        x = event.clientX;
        //resizeableEle.style.left = styles.left;
        //resizeableEle.style.right = null;

        setFrameStyle({"left": frameStyle.left,"top": frameStyle.top, "width": frameStyle.width, "height": frameStyle.height, "right": null, "bottom": frameStyle.bottom});
        document.addEventListener("mousemove", onMouseMoveRightResize);
        document.addEventListener("mouseup", onMouseUpRightResize);
      };
  
      // Top resize
      const onMouseMoveTopResize = (event) => {
        const styles = window.getComputedStyle(resizeableEle);
        let top = parseInt(styles.top, 10);
        console.log(top);

        const dy = event.clientY - y;
        
        if ((top < minYPosition && dy < 0) || (top > maxYPosition && dy > 0)){
          return;
        }

        height = height - dy;
        y = event.clientY;
        //resizeableEle.style.height = `${height}px`;
        setFrameStyle({"left": frameStyle.left,"top": frameStyle.top, "width": frameStyle.width, "height": `${height}px`, "right": frameStyle.right, "bottom": frameStyle.bottom});
      };
  
      const onMouseUpTopResize = (event) => {
        document.removeEventListener("mousemove", onMouseMoveTopResize);
      };
  
      const onMouseDownTopResize = (event) => {
        y = event.clientY;
        const styles = window.getComputedStyle(resizeableEle);
        //resizeableEle.style.bottom = styles.bottom;
        //resizeableEle.style.top = null;

        setFrameStyle({"left": frameStyle.left,"top": null, "width": frameStyle.width, "height": frameStyle.height, "right": frameStyle.right, "bottom": frameStyle.bottom});
        document.addEventListener("mousemove", onMouseMoveTopResize);
        document.addEventListener("mouseup", onMouseUpTopResize);
      };
  
      // Bottom resize
      const onMouseMoveBottomResize = (event) => {
        const styles = window.getComputedStyle(resizeableEle);
        let bottom = parseInt(styles.bottom, 10);
        console.log(bottom);

        const dy = event.clientY - y;
        if ((bottom < minYPosition && dy > 0) || (bottom > maxYPosition && dy < 0)){
          return;
        }
        
        height = height + dy;
        y = event.clientY;
        //resizeableEle.style.height = `${height}px`;
        setFrameStyle({"left": frameStyle.left,"top": frameStyle.top, "width": frameStyle.width, "height": `${height}px`, "right": frameStyle.right, "bottom": frameStyle.bottom});
      };
  
      const onMouseUpBottomResize = (event) => {
        document.removeEventListener("mousemove", onMouseMoveBottomResize);
      };
  
      const onMouseDownBottomResize = (event) => {
        y = event.clientY;
        const styles = window.getComputedStyle(resizeableEle);
        //resizeableEle.style.top = styles.top;
        //resizeableEle.style.bottom = null;

        setFrameStyle({"left": frameStyle.left,"top": frameStyle.top, "width": frameStyle.width, "height": frameStyle.height, "right": frameStyle.right, "bottom": null});
        document.addEventListener("mousemove", onMouseMoveBottomResize);
        document.addEventListener("mouseup", onMouseUpBottomResize);
      };
  
      // Left resize
      const onMouseMoveLeftResize = (event) => {
        const styles = window.getComputedStyle(resizeableEle);
        let left = parseInt(styles.left, 10);
        console.log(left);

        const dx = event.clientX - x;
        if ((left < minXPosition && dx < 0) || (left > maxXPosition && dx > 0)){
          return;
        }

        x = event.clientX;

        width = width - dx;
        //resizeableEle.style.width = `${width}px`;

        setFrameStyle({"left": frameStyle.left,"top": frameStyle.top, "width": `${width}px`, "height": frameStyle.height, "right": frameStyle.right, "bottom": frameStyle.bottom});
      };
  
      const onMouseUpLeftResize = (event) => {
        document.removeEventListener("mousemove", onMouseMoveLeftResize);
      };
  
      const onMouseDownLeftResize = (event) => {
        x = event.clientX;
        //resizeableEle.style.right = styles.right;
        //resizeableEle.style.left = null;

        setFrameStyle({"left": null,"top": frameStyle.top, "width": frameStyle.width, "height": frameStyle.height, "right": frameStyle.right, "bottom": frameStyle.bottom});
        document.addEventListener("mousemove", onMouseMoveLeftResize);
        document.addEventListener("mouseup", onMouseUpLeftResize);
      };

      function onCornerToggle(event) {
        console.log(event.code);
        if (event.repeat) {return}
        
        if (event.code === TOGGLE_CORNER_KEY) {
          console.log("Toggle Corner");
        }
      };
  
      // Add mouse down event listener
      console.log("Here");
      const resizerRight = refRight.current;
      resizerRight.addEventListener("mousedown", onMouseDownRightResize);
      const resizerTop = refTop.current;
      resizerTop.addEventListener("mousedown", onMouseDownTopResize);
      const resizerBottom = refBottom.current;
      resizerBottom.addEventListener("mousedown", onMouseDownBottomResize);
      const resizerLeft = refLeft.current;
      resizerLeft.addEventListener("mousedown", onMouseDownLeftResize);



  
      return () => {
        resizerRight.removeEventListener("mousedown", onMouseDownRightResize);
        resizerTop.removeEventListener("mousedown", onMouseDownTopResize);
        resizerBottom.removeEventListener("mousedown", onMouseDownBottomResize);
        resizerLeft.removeEventListener("mousedown", onMouseDownLeftResize);
      };
    }, []);

    console.log(frameStyle)
    return (
        <div ref={props.theRef} style={frameStyle} className="resizeable" >
          <div ref={refLeft} className="resizer resizer-l"></div>
          <div ref={refTop} className="resizer resizer-t"></div>
          <div ref={refRight} className="resizer resizer-r"></div>
          <div ref={refBottom} className="resizer resizer-b"></div>
        </div>
    );
}
    