import { Table, textToTable } from '../Components/EdgeTextExtraction.mjs';

const assert = function(condition, message) {
    if (!condition)
        throw Error('Assert failed: ' + (message || ''));
};

function testSuite() {
	testDefaultConstructor();
	testNormalConstructor();
	testInsertItem();
	testRemoveItem();
	testInsertRow();
	testRemoveRow();
	testInsertColumn();
	testRemoveColumn();
	testConvertToCSV();

	testTextToTable();
	textArrayToTableSimple();
	textArrayToTableLargeTable();
	textArrayToTableMissingEntries();
	textArrayToTableMoreEntriesThanCells();
	textArrayToTableMoreCellsThanEntries();
	textArrayToTableZeroRows();
	textArrayToTableZeroCols();
	testConvertToHTMLTableSimple();
	testConvertToHTMLTableEmptyTable();
	testConvertToHTMLTableMissingCells();
	testConvertToHTMLTableWithHeader();
	testConvertToHTMLTableWithOneCellHeader();
}

function testDefaultConstructor() {
	const table = new Table();
	assert(table.getRows() === 0);
	assert(table.getColumns() === 0);
	assert(table.getContents().length === 0);
}

function testNormalConstructor() {
	const table = new Table(3, 4);
	assert(table.getRows() === 3);
	assert(table.getColumns() === 4);
	assert(table.getContents().length === 3);
	assert(table.getContents()[1].length === 4);
}

function testInsertItem() {
	const table = new Table(3, 4);
	table.insertItem(1, 0, "H");
	assert(table.getCell(1, 0) === "H")
}

function testRemoveItem() {
	const table = new Table(3, 4);
	table.insertItem(1, 0, "H");
	table.removeItem(1, 0);
	assert(table.getCell(1, 0) === null)
}

function testInsertRow() {
	const table = new Table();
	table.insertRow(0);
	assert(table.getRows() === 1);
	assert(table.getColumns() === 0);

	assert(table.getContents().length == 1);
}

function testRemoveRow() {
	const table = new Table();
	table.insertRow(0);
	table.insertRow(1);
	table.removeRow(0);
	assert(table.getRows() === 1);
	assert(table.getColumns() === 0);
	
	assert(table.getContents().length == 1);	
}

function testInsertColumn() {
	const table = new Table(2, 1);
	table.insertColumn(0);

	assert(table.getRows() == 2);
	assert(table.getColumns() == 2);
	assert(table.getContents()[0].length == 2);
	assert(table.getContents()[1].length == 2);

}

function testRemoveColumn() {
	const table = new Table(2, 2);
	table.removeColumn(0);

	assert(table.getRows() == 2);
	assert(table.getColumns() == 1);
	assert(table.getContents()[0].length == 1);
	assert(table.getContents()[1].length == 1);

}



function testConvertToCSV() {
	const table = new Table();

	const toLoad = [
					["Year","Make","Model","Description","Price"],
					[1997,"Ford","E350","\"ac, abs, moon\"",3000.00],
					[1999,"Chevy","Venture \"Extended Edition\"","",4900.00],
					[1999,"Chevy","\"Venture \"\"Extended Edition, Very Large\"\"\"","",5000.00],
					[1996,"Jeep","Grand Cherokee","\"MUST SELL! air, moon roof, loaded\"",4799.00]
					];
	table.loadTable(toLoad);

	const output = table.convertToCSV();
}

function testTextToTable() {
	const input = "A B C D \n 1 2 3 4 \n 5 6 7 8 \n 9 10 11 12";
	const output = textToTable(input);


}

function textArrayToTableSimple() {
	const numRows = 2;
	const numCols = 2;

	const input = ["Heading1", "Heading2", "Entry1", "Entry 2"];
	const output = Table.textArrayToTable(input, numRows, numCols);

	assert(output.getRows() === 2);
	assert(output.getColumns() === 2);
	assert(output.getContents()[0].length === 2);
	assert(output.getContents()[1].length === 2);
	assert(output.getContents()[0][0] === "Heading1");
}

function textArrayToTableLargeTable() {
	const numRows = 4;
	const numCols = 4;

	const input = ["Heading 1", "Heading 2", "Heading 3", "Heading 4",
					"Entry 1", "Entry 2", "Entry 3", "Entry 4",
					"Entry 5", "Entry 6", "Entry 7", "Entry 8"];
	const output = Table.textArrayToTable(input, numRows, numCols);

	assert(output.getRows() === 4);
	assert(output.getColumns() === 4);
	assert(output.getContents()[0].length === 4);
	assert(output.getContents()[3].length === 4);
	assert(output.getContents()[1][1] === "Entry 2");
}

function textArrayToTableMissingEntries() {
	const numRows = 4;
	const numCols = 4;

	const input = ["Heading 1", "" , "Heading 3", "Heading 4",
					"Entry 1", "Entry 2", "", "Entry 4",
					"Entry 5", "Entry 6", "", "Entry 8"];
	const output = Table.textArrayToTable(input, numRows, numCols);

	assert(output.getRows() === 4);
	assert(output.getColumns() === 4);
	assert(output.getContents()[0].length === 4);
	assert(output.getContents()[3].length === 4);
	assert(output.getContents()[0][1] === "");
}

function textArrayToTableMoreEntriesThanCells() {
	const numRows = 2;
	const numCols = 2;

	const input = ["Heading 1", "" , "Heading 3", "Heading 4",
					"Entry 1", "Entry 2", "", "Entry 4",
					"Entry 5", "Entry 6", "", "Entry 8"];
	const output = Table.textArrayToTable(input, numRows, numCols);

	assert(output.getRows() === 2);
	assert(output.getColumns() === 2);
	assert(output.getContents()[0].length === 2);
	assert(output.getContents()[1].length === 2);
	assert(output.getContents()[1][1] === "Heading 4");
}

function textArrayToTableMoreCellsThanEntries() {
	const numRows = 3;
	const numCols = 3;

	const input = ["Heading1", "Heading2", "Entry1", "Entry 2"];
	const output = Table.textArrayToTable(input, numRows, numCols);

	assert(output.getRows() === 3);
	assert(output.getColumns() === 3);
	assert(output.getContents()[0].length === 3);
	assert(output.getContents()[2].length === 3);
	assert(output.getContents()[1][2] === null);
}

function textArrayToTableZeroRows() {
	const numRows = 0;
	const numCols = 3;

	const input = ["Heading1", "Heading2", "Entry1", "Entry 2"];
	const output = Table.textArrayToTable(input, numRows, numCols);

	assert(output.length === 0);
}

function textArrayToTableZeroCols() {
	const numRows = 3;
	const numCols = 0;

	const input = ["Heading1", "Heading2", "Entry1", "Entry 2"];
	const output = Table.textArrayToTable(input, numRows, numCols);

	assert(output.length === 0);
}

function testConvertToHTMLTableSimple() {
	const table = new Table();

	const toLoad = [
					["Company","Contact","Country"]
					];
	table.loadTable(toLoad);

	const output = table.convertToHTML();
	const expected = `<table>\n<tr>\n<td>Company</td>\n<td>Contact</td>\n<td>Country</td>\n</tr>\n</table>`
	assert(output === expected);
}

function testConvertToHTMLTableEmptyTable() {
	const table = new Table();

	const toLoad = [];
	table.loadTable(toLoad);

	const output = table.convertToHTML();
	const expected = `<table>\n</table>`
	assert(output === expected);
}

function testConvertToHTMLTableWithHeader() {
	const table = new Table();

	const toLoad = [
					["Company","Contact","Country"],
					["Alfreds Futterkiste","Maria Anders","Germany"],
					["Centro comercial Moctezuma","Francisco Chang","Mexico"],
					];
	table.loadTable(toLoad);

	const output = table.convertToHTML();
	const expected = "<table>\n" +
						"<thead>\n" +
						"<tr>\n" +
							"<th>Company</th>\n" +
							"<th>Contact</th>\n" +
							"<th>Country</th>\n" +
						"</tr>\n" + 
						"</thead>\n" + 
						"<tbody>\n" +
						"<tr>\n" +
							"<td>Alfreds Futterkiste</td>\n" +
							"<td>Maria Anders</td>\n" +
							"<td>Germany</td>\n" +
						"</tr>\n" +
						"<tr>\n" +
							"<td>Centro comercial Moctezuma</td>\n" +
							"<td>Francisco Chang</td>\n" +
							"<td>Mexico</td>\n" +
						"</tr>\n" +
						"</tbody>\n" +
					"</table>"
	assert(output === expected);
}

function testConvertToHTMLTableMissingCells() {
	const table = new Table();

	const toLoad = [["Company","","Country"]];
	table.loadTable(toLoad);

	const output = table.convertToHTML();
	const expected = `<table>\n<tr>\n<td>Company</td>\n<td></td>\n<td>Country</td>\n</tr>\n</table>`
	assert(output === expected);
}

function testConvertToHTMLTableWithOneCellHeader() {
	const table = new Table();

	const toLoad = [
					["","Contact",""],
					["Alfreds Futterkiste","Maria Anders","Germany"],
					["Centro comercial Moctezuma","Francisco Chang","Mexico"],
					];
	table.loadTable(toLoad);

	const output = table.convertToHTML();
	//console.log(output);
	const expected = "<table>\n" +
						"<thead>\n" +
						"<tr>\n" +
							"<th>Contact</th>\n" +
						"</tr>\n" + 
						"</thead>\n" + 
						"<tbody>\n" +
						"<tr>\n" +
							"<td>Alfreds Futterkiste</td>\n" +
							"<td>Maria Anders</td>\n" +
							"<td>Germany</td>\n" +
						"</tr>\n" +
						"<tr>\n" +
							"<td>Centro comercial Moctezuma</td>\n" +
							"<td>Francisco Chang</td>\n" +
							"<td>Mexico</td>\n" +
						"</tr>\n" +
						"</tbody>\n" +
					"</table>"
	assert(output === expected);
}

testSuite();