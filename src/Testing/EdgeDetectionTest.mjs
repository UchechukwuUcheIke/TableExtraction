import { getColumnEdgeCount, getRowEdgeCount, getSubsections, getMode } from '../Components/EdgeTextExtraction.mjs';

const assert = function(condition, message) {
    if (!condition)
        throw Error('Assert failed: ' + (message || ''));
};

function testSuite() {
    testGetColumnEdgeCountSimple();
    testGetColumnEdgeCountNoEdges();
    testGetColumnEdgeCountEmptyArray();
    testGetColumnEdgeCountMultipleColumns();

    testGetRowEdgeCountSimple();
    testGetRowEdgeCountNoEdges();
    testGetRowEdgeCountEmptyArray();
    testGetRowEdgeCountMultipleRows();

    testGetModeSimple();
    testGetModeNoMode();

    testGetSubsectionsSimple();
    testGetSubsectionsOneNonTextSection();
    testGetSubsectionsOneTextSection();
}

function testGetColumnEdgeCountSimple() {
    const ctxArray = [[[0, 0, 0, 0]],
                      [[255, 255, 255, 255]],
                      [[0, 0, 0, 0]]];
    const width = ctxArray[0].length
    const height = ctxArray.length;
    const diffThreshold = 100;
    const edgeCount = getColumnEdgeCount(ctxArray, width, height, diffThreshold);

    assert(edgeCount[0] === 2);
}

function testGetColumnEdgeCountEmptyArray() {
    const ctxArray = [];
    const width = 0;
    const height = 0;
    const diffThreshold = 100;
    const edgeCount = getColumnEdgeCount(ctxArray, width, height, diffThreshold);

    assert(edgeCount.length == 0);
}

function testGetColumnEdgeCountNoEdges() {
    const ctxArray = [[[0, 0, 0, 0]],
                      [[0, 0, 0, 0]],
                      [[0, 0, 0, 0]]];
    const width = ctxArray[0].length
    const height = 1;
    const diffThreshold = 100;
    const edgeCount = getColumnEdgeCount(ctxArray, width, height, diffThreshold);

    assert(edgeCount[0] === 0);
}

function testGetColumnEdgeCountMultipleColumns() {
    const ctxArray = [[[0, 0, 0, 0], [0, 0, 0, 0],         [0, 0, 0, 0]],
                      [[0, 0, 0, 0], [255, 255, 255, 255], [255, 255, 255, 255]],
                      [[0, 0, 0, 0], [0, 0, 0, 0],         [255, 255, 255, 255]]];
    const width = ctxArray[0].length
    const height = ctxArray.length
    const diffThreshold = 100;
    const edgeCount = getColumnEdgeCount(ctxArray, width, height, diffThreshold);

    assert(edgeCount[0] === 0);
    assert(edgeCount[1] === 2);
    assert(edgeCount[2] === 1);
}

function testGetRowEdgeCountSimple() {
    const ctxArray = [[[0, 0, 0, 0], [255, 255, 255, 255], [0, 0, 0, 0]]];
    const width = ctxArray[0].length;
    const height = ctxArray.length
    const diffThreshold = 100;
    const edgeCount = getRowEdgeCount(ctxArray, width, height, diffThreshold);

    assert(edgeCount[0] === 2);
}

function testGetRowEdgeCountEmptyArray() {
    const ctxArray = []
    const width = ctxArray.length
    const height = 0;
    const diffThreshold = 100;
    const edgeCount = getRowEdgeCount(ctxArray, width, height, diffThreshold);

    assert(edgeCount.length === 0);
}

function testGetRowEdgeCountNoEdges() {
    const ctxArray = [[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]]
    const width = ctxArray[0].length;
    const height = ctxArray.length;
    const diffThreshold = 100;
    const edgeCount = getRowEdgeCount(ctxArray, width, height, diffThreshold);

    assert(edgeCount[0] === 0);
}

function testGetRowEdgeCountMultipleRows() {
    const ctxArray = [[[0, 0, 0, 0], [0, 0, 0, 0],         [0, 0, 0, 0]],
                      [[0, 0, 0, 0], [255, 255, 255, 255], [255, 255, 255, 255]],
                      [[0, 0, 0, 0], [255, 255, 255, 255], [0, 0, 0, 0]]];
    const width = ctxArray[0].length
    const height = ctxArray.length
    const diffThreshold = 100;
    const edgeCount = getColumnEdgeCount(ctxArray, width, height, diffThreshold);

    assert(edgeCount[0] === 0);
    assert(edgeCount[1] === 1);
    assert(edgeCount[2] === 2);
}

function testGetModeSimple() {
    const array = [1, 2, 4, 3, 4];
    const mode = getMode(array);
    assert(mode == 4);
}

function testGetModeNoMode() {
    const array = [1, 2, 3, 4];
    const mode = getMode(array);

    assert(mode == 1);
}


function testGetSubsectionsSimple() {
    const edgeArray = [1, 1, 1, 3, 1, 1, 3, 1];
    const mode = 1;
    const tolerance = 1;

    const [subsections, numIsTextSections] = getSubsections(edgeArray, mode, tolerance);
    console.log(subsections);
    console.log(numIsTextSections);
    assert(numIsTextSections == 2);
    assert(subsections.length == 4);
}

function testGetSubsectionsOneNonTextSection() {
    const edgeArray = [1, 1, 1, 1, 1, 1, 1, 1];
    const mode = 1;
    const tolerance = 1;

    const [subsections, numIsTextSections] = getSubsections(edgeArray, mode, tolerance);
    console.log(subsections);
    console.log(numIsTextSections);
    assert(subsections.length == 0);
    assert(numIsTextSections == 0);
}

function testGetSubsectionsOneTextSection() {
    const edgeArray = [2, 2, 2, 2, 2, 2, 2, 2];
    const mode = 1;
    const tolerance = 1;

    const [subsections, numIsTextSections] = getSubsections(edgeArray, mode, tolerance);
    console.log(subsections);
    console.log(numIsTextSections);
    assert(subsections.length == 1);
    assert(numIsTextSections == 1);
}


testSuite();