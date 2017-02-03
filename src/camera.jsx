import React from 'react';
import classNames from 'classnames';
import ImageToCanvas from 'imagetocanvas';
import request from 'superagent';


function getOrientation(file, callback) {
  const reader = new FileReader();
  reader.onload = function (e) {

    const view = new DataView(e.target.result);
    if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
    let length = view.byteLength, offset = 2;
    while (offset < length) {
      let marker = view.getUint16(offset, false);
      offset += 2;
      if (marker == 0xFFE1) {
        if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
        let little = view.getUint16(offset += 6, false) == 0x4949;
        offset += view.getUint32(offset + 4, little);
        let tags = view.getUint16(offset, little);
        offset += 2;
        for (let i = 0; i < tags; i++)
          if (view.getUint16(offset + (i * 12), little) == 0x0112)
            return callback(view.getUint16(offset + (i * 12) + 8, little));
      }
      else if ((marker & 0xFF00) != 0xFF00) break;
      else offset += view.getUint16(offset, false);
    }
    return callback(-1);
  };
  reader.readAsArrayBuffer(file);
}

function toImg(encodedData) {
  const imgElement = document.createElement('img');
  imgElement.src = encodedData;
  return imgElement;
}

function toPng(canvas) {
  const img = document.createElement('img');
  img.src = canvas.toDataURL('image/png');
  return img;
}

function serializeImage(dataURL) {
  const BASE64_MARKER = ';base64,';
  if (dataURL.indexOf(BASE64_MARKER) == -1) {
    const parts = dataURL.split(',');
    const contentType = parts[0].split(':')[1];
    const raw = decodeURIComponent(parts[1]);
    return new Blob([raw], {type: contentType});
  }
  const parts = dataURL.split(BASE64_MARKER);
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;

  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], {type: contentType});
}

export default class Camera extends React.Component {
  constructor() {
    super();
    this.state = {
      imageLoaded: false,
      imageCanvasDisplay: 'none',
      spinnerDisplay: 'none',
      imageCanvasWidth: '28px',
      imageCanvasHeight: '320px',
      faceApiText: null,
      currentImg: null
    };
    this.putImage = this.putImage.bind(this);
    this.takePhoto = this.takePhoto.bind(this);
    this.faceRecog = this.faceRecog.bind(this);
  }


  putImage(img, orientation) {
    const canvas = this.refs.imageCanvas;
    const ctx = canvas.getContext("2d");
    let w = img.width;
    let h = img.height;
    console.log(w, h);
    const sw = w;// > 300 ? w / 0.5 : 300;
    const sh = h;// > 400 ? h / 0.5 : 400;
    let tempCanvas = document.createElement('canvas');
    let tempCtx = tempCanvas.getContext('2d');
    canvas.width = sw;
    canvas.height = sh;
    tempCanvas.width = w;
    tempCanvas.height = h;
    tempCtx.drawImage(img, 0, 0, ~~(sw / 2), ~~(sh / 2));
    ImageToCanvas.drawCanvas(canvas, toPng(tempCanvas), orientation, ~~(sw / 2), ~~(sh / 2));
    this.setState({
      imageCanvasDisplay: 'block',
      imageCanvasWidth: '280px',
      imageCanvasHeight: '320px'
    });
  }

  takePhoto(event) {
    let camera = this.refs.camera,
      files = event.target.files,
      file, w, h, mpImg, orientation;
    let canvas = this.refs.imageCanvas;
    if (files && files.length > 0) {
      file = files[0];
      const fileReader = new FileReader();
      const putImage = this.putImage;
      fileReader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        const _this = this;
        img.onload = () => {
          getOrientation(file, (orientation) => {
            if (orientation < 0) orientation = 1;
            this.putImage(img, orientation);
            this.setState({imageLoaded: true, currentImg: img.src});
            // this.faceRecog();
          });
        }
      };

      fileReader.readAsDataURL(file);
    }
  }


  faceRecog() {
    let canvas = this.refs.imageCanvas;
    const dataURL = canvas.toDataURL();

    this.setState({
      spinnerDisplay: 'block'
    });

    // There's two ways to send images to the cognitive API.
    // 1. Send a Image URL (need to set Content-Type as application/json)
    // 2. Send a binary (need to set Content-Type as octet-stream). The image need to be serialized.
    request
      .post('https://westus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false')
      .send(serializeImage(dataURL))
      .set('Content-Type', 'application/octet-stream')
      // .send({url: "http://techbeat.com/wp-content/uploads/2013/06/o-GOOGLE-FACIAL-RECOGNITION-facebook-1024x767.jpg"})
      // .set('Content-Type', 'application/json')
      .set('Ocp-Apim-Subscription-Key', '66051470820c45fa9ae399b2fcc93521')
      .set('processData', false)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err || !res.ok) {
          console.error(err);
        } else {
          const data = JSON.stringify(res.body);
          console.log(data);
          this.setState({
            faceApiText: data,
            spinnerDisplay: 'none'
          })
        }
      });

  }


  render() {
    const inputClass = classNames({
      hidden: !this.state.imageLoaded
    });
    return <div>
      <h2>Camera</h2>
      <small>Click to snap a photo or select an image from your photo roll</small>
      <div className="faceApi">
        <div className="spinner" style={{display: this.state.spinnerDisplay}}>
          <div className="double-bounce1"></div>
          <div className="double-bounce2"></div>
        </div>
        <div> {this.state.faceApiText}</div>
      </div>
      <div>
        <input type="file" label="Camera" onChange={this.takePhoto}
               ref="camera" className="camera" accept="image/*"/>

        <div  className={inputClass} style={{
          width: this.state.imageCanvasWidth,
          height: this.state.imageCanvasHeight
        }}>
          <canvas ref="imageCanvas" className="imageCanvas" id="imageCanvas" style={{
            display: 'block'
          }}>
            Your browser does not support the HTML5 canvas tag.
          </canvas>
        </div>

      </div>
    </div>
  }
}
