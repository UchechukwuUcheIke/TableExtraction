//const assert = require('node:assert');
class Table {
  #rows;
  #columns;
  #contents;

  constructor(rows, columns) {
    this.rows = rows || 0;
    this.columns = columns || 0;

    this.contents = [];
    for (let i = 0; i < rows; i++) {
      this.contents.push(new Array(columns));
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

        if (cell != null) {
          output = output.concat(cell);
        } else {
          output = output.concat("\"\"");
        }

        if (col != this.columns - 1) {
          output = output.concat(",");
        }
      }
      output = output.concat("\n");
    }

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
}

function textToTable(text) {
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


//module.exports = { Table, textToTable }



function pixelDifference(a, b) {
  const size = Math.min(a.length, b.length);
  let distanceSum = 0;
  distanceSum += (a[1] - b[1]) * (a[1] - b[1]) + (a[2] - b[2]) * (a[2] - b[2]);

  let chromaticSum = 0;
  chromaticSum += (a[0] - b[0]) * (a[0] - b[0])

  return Math.sqrt(distanceSum + chromaticSum);

}

function App() {

  function screenshotVid() {
    const canvas = document.getElementById("canvas");
    const video = document.getElementById("video");

    canvas.width = 50;
    canvas.height = 50;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    ctx.scale(0.1, 0.1)
    //console.log(ctxTo2DArray(ctx));
    const pixelValueArray = ctxTo2DArray(ctx);

    const example = [
                      [parseInt("ffffff", 16), 0, 0], [parseInt("ffffff", 16), 1, 0], [parseInt("ffffff", 16), 2, 0], [parseInt("ffffff", 16), 3, 0],
                      [parseInt("ffffff", 16), 0, 1], [parseInt("000000", 16), 1, 1], [parseInt("000000", 16), 2, 1], [parseInt("ffffff", 16), 3, 1],
                      [parseInt("ffffff", 16), 0, 2], [parseInt("000000", 16), 1, 2], [parseInt("000000", 16), 2, 2], [parseInt("ffffff", 16), 3, 2],
                      [parseInt("ffffff", 16), 0, 3], [parseInt("ffffff", 16), 1, 3], [parseInt("ffffff", 16), 2, 3], [parseInt("ffffff", 16), 3, 3],
                    ]
    const { clusters, distances, order, clustersGivenK } = clusterData({data: pixelValueArray});

    console.log(clustersGivenK);


    console.log("Done");
    (async () => {
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(canvas);
    })();
  }

  return (

    <div>
      <video id = "video" width={vidWidth} height={vidHeight} controls autoPlay loop muted>
        <source src={testvideo2mp4} type="video/mp4" />
        <source src={testvideowebm} type="video/webm" />
        <source src={testvideogv} type="video/ogg" />
        Sorry no video

      </video>

      <button onClick={screenshotVid}> Screenshot </button>
      <canvas id="canvas"> </canvas>
    </div>
  );
}

function ctxTo2DArray(ctx) {
  const sizeWidth = ctx.canvas.clientWidth;
  const sizeHeight = ctx.canvas.clientHeight;

  const result = new Array(sizeHeight * sizeWidth);
  /**
  for (let i = 0; i < sizeHeight; i++) {
    result[i] = new Array(sizeWidth);
  }
  **/
  let i = 0;
  for (let x = 0; x < sizeWidth; x++) {
    for (let y = 0; y < sizeHeight; y++) {
      const pixel = ctx.getImageData(x, y, 1, 1);
      const data = pixel.data;
      const red = data[0];
      const green = data[1];
      const blue = data[2];

      const RGBvalue = red.toString(16) + green.toString(16) + blue.toString(16);

      result[i] = [parseInt(RGBvalue, 16), x, y];
      i += 1;
    }
  }

  return result;
}


/**
const worker = createWorker({
  logger: m => console.log(m)
});

(async () => {
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize(tableSampleCleaned, 6);
  console.log(text);

  console.log("\n");
  const table = textToTable(text);
  console.log(table.convertToCSV());
  await worker.terminate();
})();
**/