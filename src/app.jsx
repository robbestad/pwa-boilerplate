require("babel-polyfill");
import Snap from './camera.jsx';
import Find from './findFace.jsx';
import React from 'react';
import {render} from 'react-dom';
render(
  <Snap />,
  document.getElementById('camera')
);
render(
  <Find />,
  document.getElementById('findFace')
);

