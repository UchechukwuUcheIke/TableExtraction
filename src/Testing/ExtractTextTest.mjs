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

function extractSimpleImage() {
    const canvas = document.createElement("canvas");
    const img = document.createElement("img");
    img.src = "./TestingImages/Image1.png"
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    canvas.width = imagedata.width;
    canvas.height = imagedata.height;
}

testSuite()