import React from 'react';
import classNames from 'classnames';
import ImageToCanvas from 'imagetocanvas';
import request from 'superagent';

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
      imageCanvasWidth: '0px',
      imageCanvasHeight: '0px',
      faceApiText: null
    };
    this.putImage = this.putImage.bind(this);
    this.saveImage = this.saveImage.bind(this);
    this.takePhoto = this.takePhoto.bind(this);
    this.faceRecog = this.faceRecog.bind(this);

    // this.faceRecog();
  }


  putImage(img, orientation) {
    const canvas = this.refs.imageCanvas;
    const ctx = canvas.getContext("2d");
    let w = img.width;
    let h = img.height;
    console.log(w,h);
    const scaleW = (w / 0.2) / 100;
    const scaleH = (h / 0.2) / 100;
    let tempCanvas = document.createElement('canvas');
    let tempCtx = tempCanvas.getContext('2d');
    canvas.width = w/scaleW < 300 ? w/scaleW : 300;
    canvas.height = h/scaleH < 400 ? h/scaleH : 400;
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(img, 0, 0, w/scaleW, h/scaleH);
    ImageToCanvas.drawCanvas(canvas, toPng(tempCanvas), orientation, scaleW, scaleH);

    // const sw = w > 300 ? w / 0.2 : 300;
    // const sh = h > 400 ? h / 0.2 : 400;
    // let tempCanvas = document.createElement('canvas');
    // let tempCtx = tempCanvas.getContext('2d');
    // canvas.width =  sw;
    // canvas.height =   sh;
    // tempCanvas.width = canvas.width;
    // tempCanvas.height = canvas.height;
    // tempCtx.drawImage(img, 0, 0, sw, sh);
    // ImageToCanvas.drawCanvas(canvas, toPng(tempCanvas), orientation, sw, sh);
    // this.setState({
    //   imageCanvasDisplay: 'block',
    //   imageCanvasWidth: sw + "px",
    //   imageCanvasHeight: sh + "px"
    // });
    this.setState({
      imageCanvasDisplay: 'block',
      imageCanvasWidth:  w/scaleW + "px",
      imageCanvasHeight: h/scaleH + "px"
    });

    this.faceRecog();
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

        //document.write(img.src);
        try {
          ImageToCanvas.getExifOrientation(ImageToCanvas.toDataURL(img.src), (orientation) => {
            putImage(img, orientation);
          });
        }
        catch (e) {
          console.log(e);
          this.putImage(img, 1);
        }
      };
      fileReader.readAsDataURL(file);
      this.setState({imageLoaded: true});
    }

  }


  faceRecog() {
    let canvas = this.refs.imageCanvas;
    const dataURL = canvas.toDataURL();

    this.setState({
      spinnerDisplay: 'block'
    });

    request
      .post('https://westus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false')
      // .send({url: "http://techbeat.com/wp-content/uploads/2013/06/o-GOOGLE-FACIAL-RECOGNITION-facebook-1024x767.jpg"})
      .send(serializeImage(dataURL))
      .set('Ocp-Apim-Subscription-Key', '66051470820c45fa9ae399b2fcc93521')
      .set('processData', false)
      .set('Accept', 'application/json')
      // .set('Content-Type', 'application/json')
      .set('Content-Type', 'application/octet-stream')
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


    //
    // new Promise((resolve, reject) => {
    //   request
    //     .post('https://westus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false')
    //     .send(('data:image/jpeg;base64,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'))
    //     .set('Ocp-Apim-Subscription-Key', '66051470820c45fa9ae399b2fcc93521')
    //     // .set('processData', false)
    //     // .set('data', serializeImage(dataURL))
    //     .set('Accept', 'application/json')
    //     .set('Content-Type', 'application/octet-stream')
    //     .end((err, res) => {
    //       console.log(err);
    //       if (err) {
    //         reject(err)
    //       }
    //       if (res.err) {
    //         reject(res.err);
    //       }
    //       resolve(res);
    //     });
    // }).then((res) => {
    //   const result = JSON.parse(res.text);
    //   console.log(result);
    // })
    //   .catch(err => console.error(err));
    //

  }

  saveImage() {
    let canvas = this.refs.imageCanvas;
    document.body.style.opacity = 0.4;

    this.setState({
      spinnerDisplay: 'block',
      imageCanvasDisplay: 'none'
    });

    const dataURL = canvas.toDataURL();

    new Promise((resolve, reject) => {
      request
        .post('/upload')
        .send({image: dataURL, username: this.props.username})
        .set('Accept', 'application/json')
        .end((err, res) => {
          console.log(err);
          if (err) {
            reject(err)
          }
          if (res.err) {
            reject(res.err);
          }
          resolve(res);
        });
    }).then((res) => {
      const result = JSON.parse(res.text);
      console.log(result);
      this.props.uploadImage(result.secure_url, this.props.username);
      this.props.history.pushState(null, 'stream');
      document.body.style.opacity = 1.0;
    });
  }

  render() {
    const inputClass = classNames({
      hidden: this.state.imageLoaded
    });
    const saveButton = classNames({
      hidden: !this.state.imageLoaded,
      "filter-button-save": true
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
      <div className={inputClass}>
        <input type="file" label="Camera" onChange={this.takePhoto}
               ref="camera" className="camera" accept="image/*"/>

        <div className="canvas">
          <canvas ref="imageCanvas" className="imageCanvas" id="imageCanvas" style={{
            width: this.state.imageCanvasWidth,
            height: this.state.imageCanvasHeight,
            display: this.state.imageCanvasDisplay
          }}>
            Your browser does not support the HTML5 canvas tag.
          </canvas>
        </div>

      </div>
    </div>
  }
}
