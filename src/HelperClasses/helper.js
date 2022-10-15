//const assert = require('node:assert');




export function AppFSMConstructor(refs) {
  /**
  * FSM that represents the states Extraction App run through based on keyboard input
  *
  * @state  START - the state the FSM begins
  * @state  SELECT_TEXT_EXTRACTION_STYLE
  * @state  SAVING_FRAME_IMAGE
  * @state  SELECT_TABLE_EXTRACTION_STYLE
  * @state  EXTRACT_TEXT_AS_NUMERICAL
  * @state  EXTRACT_TEXT_AS_NORMAL
  * @state  EXTRACT_TABLE_AS_NORMAL
  * @state  EXTRACT_TABLE_AS_NUMERICAL
  * @state  SELECT_TABLE_FORMAT
  * @state  FINISH_TEXT_EXTRACTION
  */
   const AppFSM = {
    state: 'APP_CLOSED',
    ref: null,
    transitions: {
        APP_CLOSED: {
            ref: null,
            enter() {
              this.state = "MENU";
              this.ref = this.transitions.MENU.ref;
            },
        },
        MENU: {
          enter() {
            this.state = "OPTION_SELECT";
            this.ref = this.transitions.OPTION_SELECT.ref;
          },
          esc() {
            this.state = "APP_CLOSED";
            this.ref = this.transitions.APP_CLOSED.ref;
          },
          right() {
            this.state = "FRAME";
            this.ref = this.transitions.FRAME.ref;
          },
          left() {
            this.state = "FRAME";
            this.ref = this.transitions.FRAME.ref;
          },
          ref: null,
        },
        FRAME: {
          enter() {
            this.state = "LEFT_FRAME_CORNER";
            this.ref = this.transitions.LEFT_FRAME_CORNER.ref;
          },
          esc() {
            this.state = "APP_CLOSED";
            this.ref = this.transitions.APP_CLOSED.ref;
          },
          right() {
            this.state = "MENU";
            this.ref = this.transitions.MENU.ref;
          },
          left() {
            this.state = "MENU"
            this.ref = this.transitions.MENU.ref;
          },
          ref: null,
        },
        OPTION_SELECT: {
          esc() {
            this.state = "MENU";
            this.ref = this.transitions.MENU.ref;
          },
          ref: null,
        },
        LEFT_FRAME_CORNER: {
          esc() {
            this.state = "FRAME";
            this.ref = this.transitions.FRAME.ref;
          },
          right() {
            this.state = "CENTER_FRAME";
            this.ref = this.transitions.CENTER_FRAME.ref;
          },
          left() {
            this.state = "RIGHT_FRAME_CORNER";
            this.ref = this.transitions.RIGHT_FRAME_CORNER.ref;
          },
          ref: null,
        },
        CENTER_FRAME: {
          esc() {
            this.state = "FRAME";
            this.ref = this.transitions.FRAME.ref;
          },
          right() {
            this.state = "RIGHT_FRAME_CORNER"
            this.ref = this.transitions.RIGHT_FRAME_CORNER.ref;
          },
          left() {
            this.state = "LEFT_FRAME_CORNER"
            this.ref = this.transitions.LEFT_FRAME_CORNER.ref;
          },
          ref: null,
        },
        RIGHT_FRAME_CORNER: {
          esc() {
            this.state = "FRAME";
            this.ref = this.transitions.FRAME.ref;
          },
          right() {
            this.state = "LEFT_FRAME_CORNER";
            this.ref = this.transitions.LEFT_FRAME_CORNER.ref;
          },
          left() {
            this.state = "CENTER_FRAME"
            this.ref = this.transitions.CENTER_FRAME.ref;
          },
          ref: null,
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

    getRef() {
      return this.ref;
    },
  };

  const fsm = Object.create(AppFSM);
  fsm.transitions.MENU.ref = refs.MENU;
  fsm.transitions.FRAME.ref = refs.FRAME;
  fsm.transitions.LEFT_FRAME_CORNER.ref = refs.LEFT_FRAME_CORNER;
  fsm.transitions.CENTER_FRAME.ref = refs.CENTER_FRAME;
  fsm.transitions.RIGHT_FRAME_CORNER.ref = refs.RIGHT_FRAME_CORNER;

  return fsm;
}


/**
* FSM that represents the states that the AppMenu REACT object goes through while extracting code
*
* @state  START - the state the FSM begins
* @state  SELECT_TEXT_EXTRACTION_STYLE
* @state  SAVING_FRAME_IMAGE
* @state  SELECT_TABLE_EXTRACTION_STYLE
* @state  EXTRACT_TEXT_AS_NUMERICAL
* @state  EXTRACT_TEXT_AS_NORMAL
* @state  EXTRACT_TABLE_AS_NORMAL
* @state  EXTRACT_TABLE_AS_NUMERICAL
* @state  SELECT_TABLE_FORMAT
* @state  FINISH_TEXT_EXTRACTION
*/
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

/**
* Returns an array of strings that converts any numbers present in the input array from scientific notation
* to standard notation. String that represent numbers not in scientific notation are left unaltered
* @param  textValues  An array of strings
* @return altered array of strings
*/
export function convertToStandardNotation(textValues) {
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


/**
* Class that acts as a wrapper of a 2D Array. Features several functions for converting tables into different table formats: JSON, HTML, etc
*
*/

export class Table {
  #rows;
  #columns;
  #contents;

  constructor(rows, columns) {
    this.rows = rows || 0;
    this.columns = columns || 0;

    this.contents = [];
    for (let i = 0; i < rows; i++) {
      this.contents.push(new Array(columns).fill(null));
    }
  } 

  getRows() {
    return this.rows;
  }

  getColumns() {
    return this.columns;
  }

  getCell(row, column) {
    //assert(row >= 0 && row < this.rows, "The row index is out of bounds");
    //assert(column >= 0 && column < this.columns, "The column index is out of bounds");
    return this.contents[row][column];
  }

  getContents() {
    return this.contents;
  }

  insertItem(row, column, item) {
    //assert(row >= 0 && row < this.rows, "The row index is out of bounds");
    //assert(column >= 0 && column < this.columns, "The column index is out of bounds");
    this.contents[row][column] = item;
  }

  removeItem(row, column) {
    //assert(row >= 0 && row < this.rows, "The row index is out of bounds");
    //assert(column >= 0 && column < this.columns, "The column index is out of bounds");
    this.contents[row][column] = null;
  }

  insertRow(newRowIdx) {
    //assert(newRowIdx >= 0 && newRowIdx <= this.rows + 1, "The row index is out of bounds");

    const newContents = this.contents.slice();
    const newArray = new Array(this.columns);
    newContents.splice(newRowIdx, 0, newArray);

    this.contents = newContents;
    this.rows = this.rows + 1;
  }

  removeRow(newRowIdx) {
    //assert(newRowIdx >= 0 && newRowIdx < this.rows, "The row index is out of bounds");

    const newContents = this.contents.slice();
    const newArray = new Array(this.columns);
    newContents.splice(newRowIdx, 1);

    this.contents = newContents;
    this.rows = this.rows - 1;
  }

  insertColumn(newColIdx) {
    //assert(newColIdx >= 0 && newColIdx <= this.columns + 1, "The column index is out of bounds");

    const newContents = this.contents.slice();
    for(let i = 0; i < this.rows; i++) {
      const newRow = newContents[i].splice(i, 0, null);
    }

    this.contents = newContents;
    this.columns = this.columns + 1;
  }

  insertColumnToRight() {
    const newContents = this.contents.slice();
    for(let i = 0; i < this.rows; i++) {
      const newRow = newContents[i].push(null);
    }

    this.contents = newContents;
    this.columns = this.columns + 1;
  }

  removeColumn(newColIdx) {
    //assert(newColIdx >= 0 && newColIdx < this.columns, "The column index is out of bounds");

    const newContents = this.contents.slice();
    for(let i = 0; i < this.rows; i++) {
      const newRow = newContents[i].splice(i, 1);
    }

    this.contents = newContents;
    this.columns = this.columns - 1;
  }

  convertToCSV() {
    let output = "";

    for(let row = 0; row < this.rows; row++) {
      for(let col = 0; col < this.columns; col++) {
        const cell = this.contents[row][col];

        if (cell !== null) {
          output = output.concat(cell);
        } else {
          output = output.concat("\"\"");
        }

        if (col !== this.columns - 1) {
          output = output.concat(",");
        }
      }
      output = output.concat("\n");
    }

    return output;
  }

  convertToJSON() {
   if (this.rows < 2) {
     return "{}";
   }

   let output = "["
   const headings = this.contents[0];

   for (let row = 1; row < this.rows; row++) {
     output = output.concat("{");
     for (let col = 0; col < this.columns; col++) {
       const cell = this.contents[row][col];
       const field = headings[col];
       

       if (col != this.columns - 1) {
         output = output.concat(`"${field}":"${cell}",`);
       } else {
         output = output.concat(`"${field}":"${cell}"`);
       }
     }

     if (row != this.rows - 1) {
       output = output.concat("},");
     } else {
       output = output.concat("}");
     }
     
   }

   output = output.concat("]");

   return output;
  }

  convertToHTML() {
   let output = "<table>\n";
   let hasHeading = this.rows != 1;

   for(let row = 0; row < this.rows; row++) {
     if (row === 0 && hasHeading) {
       output = output.concat("<thead>\n")
     } else if (row == 1) {
       output = output.concat("<tbody>\n")
     }

     output = output.concat("<tr>\n")
     for(let col = 0; col < this.columns; col++) {
       const cell = this.contents[row][col];

       if (cell !== null && cell !== "" && row === 0 && hasHeading) {
           output = output.concat("<th>");
           output = output.concat(cell);
           output = output.concat("</th>\n");
       } else if (cell !== null && (row !== 0 || !hasHeading)) {
           output = output.concat("<td>");
           output = output.concat(cell);
           output = output.concat("</td>\n");
       }

     }
     output = output.concat("</tr>\n");

     if (row === 0 && hasHeading) {
       output = output.concat("</thead>\n")
     } else if (row == this.rows - 1 && hasHeading) {
       output = output.concat("</tbody>\n")
     }
   }

   output = output.concat("</table>");

   return output;
  }

  loadTable(table) {
    this.contents = table;
    this.rows = table.length;

    if (table.length > 0) {
      this.columns = table[0].length;
    } else {
      this.columns = 0;
    }
    
  } 

 static textArrayToTable(textArray, numRows, numCols) {

   if (numRows == 0 || numCols == 0) {
     return [];
   }

   const table = new Table(numRows, numCols);
   const numCells = numRows * numCols;

   for (let i = 0; i < textArray.length && i < numCells; i++) {
     const word = textArray[i];

     const column = i % numCols;
     const row = Math.trunc(i / numCols);

     table.insertItem(row, column, word);
   }

   return table;
  }
}

export function textToTable(text) {
  const table = new Table(1,1);

  const wordList = text.split(" ");

  let col = 0;
  let row = 0;
  console.log(wordList);
  for(let i = 0; i < wordList.length; i++) {
    const word = wordList[i];

    if (word === "\n") { // Add a new row, skip to the next item in the list
      table.insertRow(row + 1);
      row += 1;
      col = 0;
      continue;
    }

    if (col >= table.getColumns()) { // Not enough columns in table, going to add one to the right
      table.insertColumnToRight();
    }

    table.insertItem(row, col, word);

    col += 1;
  }

  return table;
}
