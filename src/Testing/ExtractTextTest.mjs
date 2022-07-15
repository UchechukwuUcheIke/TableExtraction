var document;
import { helperExtractText } from '../Components/EdgeTextExtraction.mjs';
//import image1 from "./TestingImages/Image1.png";
const assert = function(condition, message) {
    if (!condition)
        throw Error('Assert failed: ' + (message || ''));
};

function testSuite() {
    extractSimpleImage()
}

async function extractSimpleImage() {
    const text = await helperExtractText("./TestingImages/Image1.png");
    console.log(text);
}

testSuite()