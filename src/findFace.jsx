import React from 'react';
import classNames from 'classnames';
import ImageToCanvas from 'imagetocanvas';
import request from 'superagent';
const {resizeImage} = require('./helperfncs');
const {getOrientation} = require('./getOrientation');
const {serializeImage} = require('./serializeImage');

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


export default class Camera extends React.Component {
  constructor() {
    super();
    this.state = {
      imageLoaded: false,
      imageCanvasDisplay: 'none',
      clickedTheButton: false,
      spinnerDisplay: false,
      imageCanvasWidth: '28px',
      imageCanvasHeight: '320px',
      faceApiText: null,
      userData: '',
      faceDataFound: false,
      currentImg: null
    };
    this.putImage = this.putImage.bind(this);
    this.takePhoto = this.takePhoto.bind(this);
    this.faceIdentify = this.faceIdentify.bind(this);
    this.verifyFaces = this.verifyFaces.bind(this);
    this.findSimilar = this.findSimilar.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
    this.getPersonDetails = this.getPersonDetails.bind(this);
  }


  putImage(img, orientation) {
    const canvas = this.refs.photoCanvas;
    const ctx = canvas.getContext("2d");
    let w = img.width;
    let h = img.height;

    const {sw, sh} = resizeImage(w, h);
    let tempCanvas = document.createElement('canvas');
    let tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = sw;
    tempCanvas.height = sh;
    tempCtx.drawImage(img, 0, 0, sw, sh);
    ImageToCanvas.drawCanvas(canvas, img, orientation, sw, sh, 1, 0, false);
  }

  takePhoto(event) {
    let camera = this.refs.camera,
      files = event.target.files,
      file, w, h, mpImg, orientation;
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
            this.setState({imageLoaded: true, clickedTheButton: true, currentImg: img.src});
            this.faceIdentify();
          });
        }
      };

      fileReader.readAsDataURL(file);
    }
  }


  faceIdentify() {
    let canvas = this.refs.photoCanvas;
    const dataURL = canvas.toDataURL();

    this.setState({
      spinnerDisplay: true,
      imageLoaded: false
    });

    // There's two ways to send images to the cognitive API.
    // 1. Send a Image URL (need to set Content-Type as application/json)
    // 2. Send a binary (need to set Content-Type as octet-stream). The image need to be serialized.
    request
      .post('https://westus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false')
      .send(serializeImage(this.state.currentImg))
      .set('Content-Type', 'application/octet-stream')
      // .send({url: "http://techbeat.com/wp-content/uploads/2013/06/o-GOOGLE-FACIAL-RECOGNITION-facebook-1024x767.jpg"})
      // .set('Content-Type', 'application/json')
      .set('Ocp-Apim-Subscription-Key', '286fe5360c85463bac4315dff365fdc2')
      .set('processData', false)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err || !res.ok) {
          console.error(err);
        } else {
          const faces = res.body.map(f => f.faceId);

          this.setState({
            faces
          });


          if (faces.length) {
            this.verifyFaces(faces);
          } else {
            this.setState({
              personDetails: {userData: 'No faces found'},
              spinnerDisplay: false,
              imageLoaded: true
            })
          }

          // this.findSimilar(faces[0]);
        }
      });
  }

  findSimilar(face) {
    // NEEDS A FACE LIST
    const body = {
      "faceId": face,
      "faceListId": "aspc2017faces",
      "maxNumOfCandidatesReturned": 10,
      "mode": "matchPerson"
    };

    request
      .post('https://westus.api.cognitive.microsoft.com/face/v1.0/findsimilars')
      .send(body)
      .set('Content-Type', 'application/json')
      .set('Ocp-Apim-Subscription-Key', '286fe5360c85463bac4315dff365fdc2')
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err || !res.ok) {
          console.error(err);
        } else {
          alert(JSON.stringify(res.body));
        }
      });
  }

  verifyFaces(faces) {
    // NEEDS A PERSON GROUP
    this.setState({
      imageLoaded: false
    });

    const body = {
      "personGroupId": "aspc2017facegroup",
      "faceIds": faces,
      "maxNumOfCandidatesReturned": 1,
      "confidenceThreshold": 0.5
    };
    // console.log(body);
    request
      .post('https://westus.api.cognitive.microsoft.com/face/v1.0/identify')
      .send(body)
      .set('Content-Type', 'application/json')
      .set('Ocp-Apim-Subscription-Key', '286fe5360c85463bac4315dff365fdc2')
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err || !res.ok) {
          console.error(err);
        } else {
          if (res.body.length < 0) {
            this.setState({
              personDetails: {userData: 'No match found'},
              spinnerDisplay: false,
              imageLoaded: true
            })
          } else {
            this.getPersonDetails(res.body[0].candidates[0].personId);
          }
        }
      });
  }

  getPersonDetails(personId) {
    request
      .get('https://westus.api.cognitive.microsoft.com/face/v1.0/persongroups/aspc2017facegroup/persons/' + personId)
      .set('Ocp-Apim-Subscription-Key', '286fe5360c85463bac4315dff365fdc2')
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err || !res.ok) {
          console.error(err);
        } else {
          //RETURN PERSON DETAILS
          this.setState({
            personDetails: res.body,
            spinnerDisplay: false,
            imageLoaded: true
          });
        }
      });

  }


  uploadImage() {
    // store ID to FACE API
    let canvas = this.refs.photoCanvas;
    const dataURL = canvas.toDataURL();

    const {userData} = this.state;

    request
      .post('https://westus.api.cognitive.microsoft.com/face/v1.0/facelists/aspc2017faces/persistedFaces?userData=' + JSON.stringify(userData))
      .send(serializeImage(this.state.currentImg))
      .set('Content-Type', 'application/octet-stream')
      .set('Ocp-Apim-Subscription-Key', '286fe5360c85463bac4315dff365fdc2')
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err || !res.ok) {
          console.error(err);
        } else {
          const data = JSON.stringify(res.body);
          //RETURNS A PERSISTED FACE ID
          console.log(data);
          alert(data);
          window.location.href = "/#uploaded";
        }
      });


  }

  render() {
    const canvasCSS = classNames({
      hidden: !this.state.imageLoaded,
      cameraFrame: true
    });

    const buttonCSS = classNames({
      hidden: this.state.clickedTheButton
    });

    const spinnerCSS = classNames({
      hidden: !this.state.spinnerDisplay
    });
    const innerSpinnerCSS = classNames({
      spinner: true
    });

    const addCSS = classNames({
      hidden: this.state.spinnerDisplay,
      metaInput: true

    });

    return <div>
      <h1 className="center">IDENTIFY</h1>
      <div className="center">
        <div className={buttonCSS}>
          <label className="camera-snap">
            <img src="/assets/camera.svg" className="icon-camera"
                 alt="Click to snap a photo or select an image from your photo roll"/>
            <input type="file" label="Camera" onChange={this.takePhoto}
                   ref="camera" className="camera" accept="image/*"/>
          </label>
        </div>


        <div className={spinnerCSS}>
          <div className={innerSpinnerCSS}>
            <div className="double-bounce1"></div>
            <div className="double-bounce2"></div>
          </div>
        </div>

        <div className={canvasCSS}>
          <canvas ref="photoCanvas" className="imageCanvas">
            Your browser does not support the HTML5 canvas tag.
          </canvas>
        </div>

        <div className={addCSS}>
          <div className="personDetails">
            {this.state.personDetails && this.state.personDetails.name}
          </div>

          <div className="personDetails">
            {this.state.personDetails && this.state.personDetails.userData}
          </div>
        </div>

      </div>
    </div>
  }
}
