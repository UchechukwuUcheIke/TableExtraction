import {useState} from 'react';
export function ContextMenu(props) {

    const [ display, setDisplay ] = useState('none');
    const [ top, setTop ] = useState(null);
    const [ left, setLeft ] = useState(null);
  
    function rightClick(e) {
  
      e.preventDefault();
      if (display === "block") {
        setDisplay("none");
      } else {
        setDisplay("block");
        setTop(e.pageY + "px");
        setLeft(e.pageX + "px");
      }
    }
  
    function hideMenu() {
      setDisplay("none");
    }
  
    function handleButtonClick() {
      props.setAppMenuDisplay("block");
    } 
  
    document.onclick = hideMenu;
    document.oncontextmenu = rightClick;
  
    return (
      <div id="contextMenu" className="context-menu" style={{"display": display, "top": top, "left": left}}>
        <ul>
          <li> <button onClick={handleButtonClick}>Open Text Extraction</button> </li>
        </ul>
      </div>
    );
  }