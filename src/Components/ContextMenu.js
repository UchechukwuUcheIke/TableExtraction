import {useState} from 'react';
import "./ContextMenu.css";
export function ContextMenu(props) {

    const top = props.contextMenuTop;
    const left = props.contextMenuLeft;
    const showContextMenu = props.showContextMenu;
  
    function handleButtonClick() {
      props.setShowAppMenu(true);
    } 
  
    return (
        <div data-testid = "ContextMenu" id="contextMenu" className="context-menu" style={{"top": top, "left": left}}>
          <ul>
            <li> <button onClick={handleButtonClick}>Open Text Extraction</button> </li>
          </ul>
        </div>
    );
  }