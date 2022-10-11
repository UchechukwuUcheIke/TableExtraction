import React, { useState, useEffect, useRef } from 'react';

import ReactDOM from 'react-dom/client';
import './index.css';
import { VideoApp } from "./VideoApp";

import testvideomp4 from "./TestVideo.mp4";
import testvideo2mp4 from "./TestVideo2.0.mp4"
import testvideo3mp4 from "./TestVideo3.0.mp4"
import testvideowebm from "./TestVideo.webm";
import testvideogv from "./TestVideo.ogv";
import tableSample from "./TableSample.jpg"
import eng_bw from "./eng_bw.png"
import tableSampleCleaned from "./TableSampleCleaned.png";
import msTableSample from "./MSWordTableSample.png";
import image1 from "./Testing/TestingImages/image16.PNG";
import image2 from "./Testing/TestingImages/image15.PNG";

const vidWidth = 1920;
const vidHeight = 1080;

function Demo() {
  return (
    <div>
      <VideoApp />
      
      <video  id = "video" width={vidWidth} height={vidHeight} controls autoPlay loop muted>
        <source src={testvideo3mp4} type="video/mp4" />
        <source src={testvideowebm} type="video/webm" />
        <source src={testvideogv} type="video/ogg" />
        Sorry no video

      </video>

      <img id = "image" src = {image1} style={{"position":"absolute", "left": "1200px","top": "1300px",
                                                    "width": "1920px", "height": "1080px"}} />
      <img id = "image" src = {image2} style={{"position":"absolute", "left": "80px","top": "1300px",
                                                    "width": "1920px", "height": "1080px"}} />
      
    </div>
  );
}

let container = null;

document.addEventListener('DOMContentLoaded', function(event) {
  if (!container) {
    container = document.getElementById('root');
    const root = ReactDOM.createRoot(container)
    root.render(
      <Demo />
    );
  }
});
