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
      spinnerDisplay: false,
      imageCanvasWidth: '28px',
      imageCanvasHeight: '320px',
      faceApiText: null,
      updateFeedback: '',
      storingFace: false,
      userData: '',
      detectedFaces: null,
      faceDataFound: false,
      currentImg: null
    };
    this.putImage = this.putImage.bind(this);
    this.takePhoto = this.takePhoto.bind(this);
    this.faceRecog = this.faceRecog.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
    this.createPersistedFaceID = this.createPersistedFaceID.bind(this);
    this.addPersonFace = this.addPersonFace.bind(this);
    this.createPerson = this.createPerson.bind(this);
    this.trainGroup = this.trainGroup.bind(this);
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
            this.setState({imageLoaded: true, currentImg: img.src});
            this.faceRecog();

          });
        }
      };

      fileReader.readAsDataURL(file);
    }
  }


  faceRecog() {
    let canvas = this.refs.photoCanvas;
    const dataURL = canvas.toDataURL();

    this.setState({
      spinnerDisplay: true
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
          const data = JSON.stringify(res.body);
          console.log(data);
          const faces = res.body.map(f => {
            return {
              faceId: f.faceId,
              target: '' + f.faceRectangle.top + ',' + f.faceRectangle.left + ',' + f.faceRectangle.width + ',' + f.faceRectangle.height,
              faceRectangle: f.faceRectangle
            }
          });
          this.setState({
            detectedFaces: faces,
            faceApiText: data,
            faceDataFound: true,
            spinnerDisplay: false
          })
        }
      });
  }

  createPersistedFaceID() {
    //RETURNS A PERSISTED FACE ID

    let canvas = this.refs.photoCanvas;
    const dataURL = canvas.toDataURL();

    const {userData} = this.state;
    return new Promise((resolve, reject) => {
      request
        .post('https://westus.api.cognitive.microsoft.com/face/v1.0/facelists/aspc2017faces/persistedFaces')
        .send(serializeImage(this.state.currentImg))
        .set('Content-Type', 'application/octet-stream')
        .set('Ocp-Apim-Subscription-Key', '286fe5360c85463bac4315dff365fdc2')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err || !res.ok) {
            console.error(err);
          } else {
            resolve(res.body);
          }
        })
    });
  }

  createPerson() {
    // RETURNS a personId
    const {userData} = this.state;
    return new Promise((resolve, reject) => {
      request
        .post('https://westus.api.cognitive.microsoft.com/face/v1.0/persongroups/aspc2017facegroup/persons')
        .send({
          "name": this.refs.inputname.value,
          "userData": this.refs.inputdata.value
        })
        .set('Ocp-Apim-Subscription-Key', '286fe5360c85463bac4315dff365fdc2')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err || !res.ok) {
            console.error(err);
          } else {
            const data = JSON.stringify(res.body);
            resolve(res.body.personId);
          }
        })
    });
  }

  trainGroup() {
    // RETURNS a personId
    const {userData} = this.state;
    return new Promise((resolve, reject) => {
      request
        .post('https://westus.api.cognitive.microsoft.com/face/v1.0/persongroups/aspc2017facegroup/train')
        .set('Ocp-Apim-Subscription-Key', '286fe5360c85463bac4315dff365fdc2')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err || !res.ok) {
            alert(err);
          } else {
            resolve(res);
          }
        })
    });
  }

  addPersonFace(personId, targetFace) {
    const {userData} = this.state;
    return new Promise((resolve, reject) => {
      request
        .post('https://westus.api.cognitive.microsoft.com/face/v1.0/persongroups/aspc2017facegroup/persons/' + personId + '/persistedFaces')
        .send(serializeImage(this.state.currentImg))
        .set('Content-Type', 'application/octet-stream')
        .set('Ocp-Apim-Subscription-Key', '286fe5360c85463bac4315dff365fdc2')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err || !res.ok) {
            console.error(err);
          } else {
            const data = JSON.stringify(res.body);
            resolve(data);
          }
        })
    });

  }


  uploadImage() {
    // store ID to FACE API

    this.setState({
      spinnerDisplay: true,
      storingFace: true,
      updateFeedback: 'Creating a face ID'
    });

    // CREATE A PERSISTED FACE ID
    this.createPersistedFaceID()
      .then(persistedFaceId => {
        this.setState({
          updateFeedback: 'Creating a Person'
        });

        // CREATE A PERSON
        this.createPerson()
          .then(personId => {
            // ADD A PERSON FACE
            this.setState({
              updateFeedback: 'Adding the face to the person'
            });

            this.addPersonFace(personId)
              .then(persistedGroupFaceId => {
                this.setState({
                  updateFeedback: 'Training the new list'
                });

                this.trainGroup()
                  .then(() => {
                    // Returns a persistedGroupFaceId
                    this.setState({
                      updateFeedback: ''
                    });

                    console.log('success');
                    console.log('persistedFaceId', persistedFaceId);
                    console.log('personId', personId);
                    console.log('persistedGroupFaceId', persistedGroupFaceId);
                    window.location.href = "/#uploaded";
                  })

              })
              .catch(err => {
                alert(JSON.stringify(err));
              });
          })
          .catch(err => {
            alert(JSON.stringify(err));
          });
      })
      .catch(err => {
        alert(JSON.stringify(err));
      });


  }

  render() {
    const canvasCSS = classNames({
      hidden: !this.state.faceDataFound,
      cameraFrame: true
    });
    const buttonCSS = classNames({
      hidden: this.state.imageLoaded
    });
    const spinnerCSS = classNames({
      hidden: !this.state.spinnerDisplay
    });
    const innerSpinnerCSS = classNames({
      spinner: true
    });

    const addCSS = classNames({
      hidden: !this.state.faceDataFound,
      metaInput: true
    });

    const hideWhileStoring = classNames({
      hidden: this.state.storingFace
    });

    const showWhileStoring = classNames({
      hidden: !this.state.storingFace && this.state.updateFeedback !== ''
    });


    return <div>
      <h1 className="center">ADD A PERSON</h1>
      <div className="center">

        <div className={buttonCSS}>
          <label className="camera-snap">
            <img src="/assets/camera.svg" className="icon-camera"
                 alt="Click to snap a photo or select an image from your photo roll"/>
            <input type="file" label="Camera" onChange={this.takePhoto}
                   ref="camera" className="camera" accept="image/*"/>
          </label>
        </div>

        <div className={showWhileStoring}>
          {this.state.updateFeedback}
        </div>

        <div className={spinnerCSS}>
          <div className={innerSpinnerCSS}>
            <div className="double-bounce1"></div>
            <div className="double-bounce2"></div>
          </div>
        </div>

        <div className={hideWhileStoring}>
          <div className={canvasCSS}>
            <canvas ref="photoCanvas" className="imageCanvas">
              Your browser does not support the HTML5 canvas tag.
            </canvas>
          </div>


          <div className={addCSS}>
            <label htmlFor="name">NAME</label>
            <input id="name" type="text" ref="inputname" className="darkInput"/>

            <label htmlFor="metadata">METADATA</label>
            <textarea id="metadata" ref="inputdata" className="darkInput"/>

            <label htmlFor="addBtn"></label>
            <button id="addBtn" className="darkButton" onClick={this.uploadImage} value="add">ADD</button>
          </div>
        </div>


      </div>
    </div>
  }
}
