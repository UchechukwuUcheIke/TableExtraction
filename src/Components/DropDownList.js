import "./DropDownList.css"
export function DropDownList() {

    return(
        <div id="myDropdown" className="dropdown-content">
            <input type="text" placeholder="Search Language.." id="myInput"/>
            <a href="#afr">Afrikaans</a>
            <a href="#amh">Amharic</a>
            <a href="#ara">Arabic</a>
        </div>
    )
}