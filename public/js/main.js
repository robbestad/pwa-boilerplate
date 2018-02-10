webpackJsonp([0],{

/***/ 140:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.getOrientation = function (file, callback) {
  var reader = new FileReader();
  reader.onload = function (e) {

    var view = new DataView(e.target.result);
    if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
    var length = view.byteLength,
        offset = 2;
    while (offset < length) {
      var marker = view.getUint16(offset, false);
      offset += 2;
      if (marker == 0xFFE1) {
        if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
        var little = view.getUint16(offset += 6, false) == 0x4949;
        offset += view.getUint32(offset + 4, little);
        var tags = view.getUint16(offset, little);
        offset += 2;
        for (var i = 0; i < tags; i++) {
          if (view.getUint16(offset + i * 12, little) == 0x0112) return callback(view.getUint16(offset + i * 12 + 8, little));
        }
      } else if ((marker & 0xFF00) != 0xFF00) break;else offset += view.getUint16(offset, false);
    }
    return callback(-1);
  };
  reader.readAsArrayBuffer(file);
};

/***/ }),

/***/ 141:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.resizeImage = function (w, h) {
  var maxWidth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1000;
  var maxHeight = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1000;

  var sw = w;
  var sh = h;
  var aspect = w / h;
  if (sw > maxWidth) {
    sw = maxWidth;
    sh = ~~(sw / aspect);
  }
  if (sh > maxHeight) {
    aspect = w / h;
    sh = maxHeight;
    sw = ~~(sh * aspect);
  }
  return { sw: sw, sh: sh };
};
exports.toImg = function (encodedData) {
  var imgElement = document.createElement('img');
  imgElement.src = encodedData;
  return imgElement;
};

exports.toPng = function (canvas) {
  var img = document.createElement('img');
  img.src = canvas.toDataURL('image/png');
  return img;
};

/***/ }),

/***/ 142:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.serializeImage = function (dataURL) {
  var BASE64_MARKER = ';base64,';
  if (dataURL.indexOf(BASE64_MARKER) == -1) {
    var _parts = dataURL.split(',');
    var _contentType = _parts[0].split(':')[1];
    var _raw = decodeURIComponent(_parts[1]);
    return new Blob([_raw], { type: _contentType });
  }
  var parts = dataURL.split(BASE64_MARKER);
  var contentType = parts[0].split(':')[1];
  var raw = window.atob(parts[1]);
  var rawLength = raw.length;

  var uInt8Array = new Uint8Array(rawLength);

  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};

/***/ }),

/***/ 203:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _camera = __webpack_require__(205);

var _camera2 = _interopRequireDefault(_camera);

var _findFace = __webpack_require__(206);

var _findFace2 = _interopRequireDefault(_findFace);

var _react = __webpack_require__(137);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(405);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

__webpack_require__(204);

(0, _reactDom.render)(_react2.default.createElement(_camera2.default, null), document.getElementById('camera'));
(0, _reactDom.render)(_react2.default.createElement(_findFace2.default, null), document.getElementById('findFace'));

/***/ }),

/***/ 205:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(137);

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(171);

var _classnames2 = _interopRequireDefault(_classnames);

var _imagetocanvas = __webpack_require__(175);

var _imagetocanvas2 = _interopRequireDefault(_imagetocanvas);

var _superagent = __webpack_require__(200);

var _superagent2 = _interopRequireDefault(_superagent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = __webpack_require__(141),
    resizeImage = _require.resizeImage,
    toPng = _require.toPng,
    toImg = _require.toImg;

var _require2 = __webpack_require__(140),
    getOrientation = _require2.getOrientation;

var _require3 = __webpack_require__(142),
    serializeImage = _require3.serializeImage;

var Camera = function (_React$Component) {
  _inherits(Camera, _React$Component);

  function Camera() {
    _classCallCheck(this, Camera);

    var _this2 = _possibleConstructorReturn(this, (Camera.__proto__ || Object.getPrototypeOf(Camera)).call(this));

    _this2.state = {
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
    _this2.putImage = _this2.putImage.bind(_this2);
    _this2.takePhoto = _this2.takePhoto.bind(_this2);
    _this2.faceRecog = _this2.faceRecog.bind(_this2);
    _this2.uploadImage = _this2.uploadImage.bind(_this2);
    _this2.createPersistedFaceID = _this2.createPersistedFaceID.bind(_this2);
    _this2.addPersonFace = _this2.addPersonFace.bind(_this2);
    _this2.createPerson = _this2.createPerson.bind(_this2);
    _this2.trainGroup = _this2.trainGroup.bind(_this2);
    return _this2;
  }

  _createClass(Camera, [{
    key: 'putImage',
    value: function putImage(img, orientation) {
      var canvas = this.refs.photoCanvas;
      var ctx = canvas.getContext("2d");
      var w = img.width;
      var h = img.height;

      var _resizeImage = resizeImage(w, h),
          sw = _resizeImage.sw,
          sh = _resizeImage.sh;

      var tempCanvas = document.createElement('canvas');
      var tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = sw;
      tempCanvas.height = sh;
      tempCtx.drawImage(img, 0, 0, sw, sh);
      _imagetocanvas2.default.drawCanvas(canvas, img, orientation, sw, sh, 1, 0, false);
    }
  }, {
    key: 'takePhoto',
    value: function takePhoto(event) {
      var _this3 = this;

      var camera = this.refs.camera,
          files = event.target.files,
          file = void 0,
          w = void 0,
          h = void 0,
          mpImg = void 0,
          orientation = void 0;
      if (files && files.length > 0) {
        file = files[0];
        var fileReader = new FileReader();
        var putImage = this.putImage;
        fileReader.onload = function (event) {
          var img = new Image();
          img.src = event.target.result;
          var _this = _this3;
          img.onload = function () {
            getOrientation(file, function (orientation) {
              if (orientation < 0) orientation = 1;
              _this3.putImage(img, orientation);
              _this3.setState({ imageLoaded: true, currentImg: img.src });
              _this3.faceRecog();
            });
          };
        };

        fileReader.readAsDataURL(file);
      }
    }
  }, {
    key: 'faceRecog',
    value: function faceRecog() {
      var _this4 = this;

      var canvas = this.refs.photoCanvas;
      var dataURL = canvas.toDataURL();

      this.setState({
        spinnerDisplay: true
      });

      // There's two ways to send images to the cognitive API.
      // 1. Send a Image URL (need to set Content-Type as application/json)
      // 2. Send a binary (need to set Content-Type as octet-stream). The image need to be serialized.
      _superagent2.default.post('https://westus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false').send(serializeImage(this.state.currentImg)).set('Content-Type', 'application/octet-stream')
      // .send({url: "http://techbeat.com/wp-content/uploads/2013/06/o-GOOGLE-FACIAL-RECOGNITION-facebook-1024x767.jpg"})
      // .set('Content-Type', 'application/json')
      .set('Ocp-Apim-Subscription-Key', '286fe5360c85463bac4315dff365fdc2').set('processData', false).set('Accept', 'application/json').end(function (err, res) {
        if (err || !res.ok) {
          console.error(err);
        } else {
          var data = JSON.stringify(res.body);
          console.log(data);
          var faces = res.body.map(function (f) {
            return {
              faceId: f.faceId,
              target: '' + f.faceRectangle.top + ',' + f.faceRectangle.left + ',' + f.faceRectangle.width + ',' + f.faceRectangle.height,
              faceRectangle: f.faceRectangle
            };
          });
          _this4.setState({
            detectedFaces: faces,
            faceApiText: data,
            faceDataFound: true,
            spinnerDisplay: false
          });
        }
      });
    }
  }, {
    key: 'createPersistedFaceID',
    value: function createPersistedFaceID() {
      var _this5 = this;

      //RETURNS A PERSISTED FACE ID

      var canvas = this.refs.photoCanvas;
      var dataURL = canvas.toDataURL();

      var userData = this.state.userData;

      return new Promise(function (resolve, reject) {
        _superagent2.default.post('https://westus.api.cognitive.microsoft.com/face/v1.0/facelists/aspc2017faces/persistedFaces').send(serializeImage(_this5.state.currentImg)).set('Content-Type', 'application/octet-stream').set('Ocp-Apim-Subscription-Key', '286fe5360c85463bac4315dff365fdc2').set('Accept', 'application/json').end(function (err, res) {
          if (err || !res.ok) {
            console.error(err);
          } else {
            resolve(res.body);
          }
        });
      });
    }
  }, {
    key: 'createPerson',
    value: function createPerson() {
      var _this6 = this;

      // RETURNS a personId
      var userData = this.state.userData;

      return new Promise(function (resolve, reject) {
        _superagent2.default.post('https://westus.api.cognitive.microsoft.com/face/v1.0/persongroups/aspc2017facegroup/persons').send({
          "name": _this6.refs.inputname.value,
          "userData": _this6.refs.inputdata.value
        }).set('Ocp-Apim-Subscription-Key', '286fe5360c85463bac4315dff365fdc2').set('Content-Type', 'application/json').set('Accept', 'application/json').end(function (err, res) {
          if (err || !res.ok) {
            console.error(err);
          } else {
            var data = JSON.stringify(res.body);
            resolve(res.body.personId);
          }
        });
      });
    }
  }, {
    key: 'trainGroup',
    value: function trainGroup() {
      // RETURNS a personId
      var userData = this.state.userData;

      return new Promise(function (resolve, reject) {
        _superagent2.default.post('https://westus.api.cognitive.microsoft.com/face/v1.0/persongroups/aspc2017facegroup/train').set('Ocp-Apim-Subscription-Key', '286fe5360c85463bac4315dff365fdc2').set('Content-Type', 'application/json').set('Accept', 'application/json').end(function (err, res) {
          if (err || !res.ok) {
            alert(err);
          } else {
            resolve(res);
          }
        });
      });
    }
  }, {
    key: 'addPersonFace',
    value: function addPersonFace(personId, targetFace) {
      var _this7 = this;

      var userData = this.state.userData;

      return new Promise(function (resolve, reject) {
        _superagent2.default.post('https://westus.api.cognitive.microsoft.com/face/v1.0/persongroups/aspc2017facegroup/persons/' + personId + '/persistedFaces').send(serializeImage(_this7.state.currentImg)).set('Content-Type', 'application/octet-stream').set('Ocp-Apim-Subscription-Key', '286fe5360c85463bac4315dff365fdc2').set('Accept', 'application/json').end(function (err, res) {
          if (err || !res.ok) {
            console.error(err);
          } else {
            var data = JSON.stringify(res.body);
            resolve(data);
          }
        });
      });
    }
  }, {
    key: 'uploadImage',
    value: function uploadImage() {
      var _this8 = this;

      // store ID to FACE API

      this.setState({
        spinnerDisplay: true,
        storingFace: true,
        updateFeedback: 'Creating a face ID'
      });

      // CREATE A PERSISTED FACE ID
      this.createPersistedFaceID().then(function (persistedFaceId) {
        _this8.setState({
          updateFeedback: 'Creating a Person'
        });

        // CREATE A PERSON
        _this8.createPerson().then(function (personId) {
          // ADD A PERSON FACE
          _this8.setState({
            updateFeedback: 'Adding the face to the person'
          });

          _this8.addPersonFace(personId).then(function (persistedGroupFaceId) {
            _this8.setState({
              updateFeedback: 'Training the new list'
            });

            _this8.trainGroup().then(function () {
              // Returns a persistedGroupFaceId
              _this8.setState({
                updateFeedback: ''
              });

              console.log('success');
              console.log('persistedFaceId', persistedFaceId);
              console.log('personId', personId);
              console.log('persistedGroupFaceId', persistedGroupFaceId);
              window.location.href = "/#uploaded";
            });
          }).catch(function (err) {
            alert(JSON.stringify(err));
          });
        }).catch(function (err) {
          alert(JSON.stringify(err));
        });
      }).catch(function (err) {
        alert(JSON.stringify(err));
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var canvasCSS = (0, _classnames2.default)({
        hidden: !this.state.faceDataFound,
        cameraFrame: true
      });
      var buttonCSS = (0, _classnames2.default)({
        hidden: this.state.imageLoaded
      });
      var spinnerCSS = (0, _classnames2.default)({
        hidden: !this.state.spinnerDisplay
      });
      var innerSpinnerCSS = (0, _classnames2.default)({
        spinner: true
      });

      var addCSS = (0, _classnames2.default)({
        hidden: !this.state.faceDataFound,
        metaInput: true
      });

      var hideWhileStoring = (0, _classnames2.default)({
        hidden: this.state.storingFace
      });

      var showWhileStoring = (0, _classnames2.default)({
        hidden: !this.state.storingFace && this.state.updateFeedback !== ''
      });

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'div',
          { className: 'center vertical-aligned' },
          _react2.default.createElement(
            'div',
            { className: buttonCSS },
            _react2.default.createElement(
              'label',
              { className: 'camera-snap' },
              _react2.default.createElement('img', { src: '/assets/camera_bw.svg', className: 'icon-camera',
                alt: 'Click to snap a photo or select an image from your photo roll' }),
              _react2.default.createElement('input', { type: 'file', label: 'Camera', onChange: this.takePhoto,
                ref: 'camera', className: 'camera', accept: 'image/*' })
            )
          ),
          _react2.default.createElement(
            'div',
            { className: showWhileStoring },
            this.state.updateFeedback
          ),
          _react2.default.createElement(
            'div',
            { className: spinnerCSS },
            _react2.default.createElement(
              'div',
              { className: innerSpinnerCSS },
              _react2.default.createElement('div', { className: 'double-bounce1' }),
              _react2.default.createElement('div', { className: 'double-bounce2' })
            )
          ),
          _react2.default.createElement(
            'div',
            { className: hideWhileStoring },
            _react2.default.createElement(
              'div',
              { className: canvasCSS },
              _react2.default.createElement(
                'canvas',
                { ref: 'photoCanvas', className: 'imageCanvas' },
                'Your browser does not support the HTML5 canvas tag.'
              )
            ),
            _react2.default.createElement(
              'div',
              { className: addCSS },
              _react2.default.createElement(
                'label',
                { htmlFor: 'name' },
                'NAME'
              ),
              _react2.default.createElement('input', { id: 'name', type: 'text', ref: 'inputname', className: 'darkInput' }),
              _react2.default.createElement(
                'label',
                { htmlFor: 'metadata' },
                'METADATA'
              ),
              _react2.default.createElement('textarea', { id: 'metadata', ref: 'inputdata', className: 'darkInput' }),
              _react2.default.createElement('label', { htmlFor: 'addBtn' }),
              _react2.default.createElement(
                'button',
                { id: 'addBtn', className: 'darkButton', onClick: this.uploadImage, value: 'add' },
                'ADD'
              )
            )
          )
        )
      );
    }
  }]);

  return Camera;
}(_react2.default.Component);

exports.default = Camera;

/***/ }),

/***/ 206:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(137);

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(171);

var _classnames2 = _interopRequireDefault(_classnames);

var _imagetocanvas = __webpack_require__(175);

var _imagetocanvas2 = _interopRequireDefault(_imagetocanvas);

var _superagent = __webpack_require__(200);

var _superagent2 = _interopRequireDefault(_superagent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = __webpack_require__(141),
    resizeImage = _require.resizeImage,
    toPng = _require.toPng,
    toImg = _require.toImg;

var _require2 = __webpack_require__(140),
    getOrientation = _require2.getOrientation;

var _require3 = __webpack_require__(142),
    serializeImage = _require3.serializeImage;

var uuid = __webpack_require__(494);

var createTransaction = function createTransaction(e) {
  var senderId = e.target.form.senderId.value;
  var messengerId = e.target.form.messengers[e.target.form.messengers.selectedIndex].value;
  var receiverId = e.target.form.receivers[e.target.form.receivers.selectedIndex].value;
  return fetch("/createTransaction", {
    method: "POST",
    headers: new Headers({
      "Accept": "application/json",
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({
      senderId: senderId,
      messengerId: messengerId,
      receiverId: receiverId
    })
  });
};

var sendMessage = function sendMessage(e) {
  var message = e.target.form.message.value;
  var receiverId = e.target.form.receivers[e.target.form.receivers.selectedIndex].value;
  return fetch("/sendMessage", {
    method: "POST",
    headers: new Headers({
      "Accept": "application/json",
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({
      message: message,
      receiverId: receiverId
    })
  });
};

function findSimilar(face) {
  // NEEDS A FACE LIST
  var body = {
    "faceId": face,
    "faceListId": "aspc2017faces",
    "maxNumOfCandidatesReturned": 10,
    "mode": "matchPerson"
  };

  _superagent2.default.post('https://westus.api.cognitive.microsoft.com/face/v1.0/findsimilars').send(body).set('Content-Type', 'application/json').set('Ocp-Apim-Subscription-Key', '286fe5360c85463bac4315dff365fdc2').set('Accept', 'application/json').end(function (err, res) {
    if (err || !res.ok) {
      console.error(err);
    } else {
      alert(JSON.stringify(res.body));
    }
  });
}

var Camera = function (_React$Component) {
  _inherits(Camera, _React$Component);

  function Camera() {
    _classCallCheck(this, Camera);

    var _this2 = _possibleConstructorReturn(this, (Camera.__proto__ || Object.getPrototypeOf(Camera)).call(this));

    _this2.state = {
      imageLoaded: false,
      imageCanvasDisplay: 'none',
      clickedTheButton: false,
      spinnerDisplay: false,
      imageCanvasWidth: '28px',
      imageCanvasHeight: '320px',
      faceApiText: null,
      userData: '',
      faceDataFound: false,
      showMessageForm: false,
      messageSent: false,
      currentImg: null
    };
    _this2.putImage = _this2.putImage.bind(_this2);
    _this2.takePhoto = _this2.takePhoto.bind(_this2);
    _this2.faceIdentify = _this2.faceIdentify.bind(_this2);
    _this2.verifyFaces = _this2.verifyFaces.bind(_this2);
    _this2.uploadImage = _this2.uploadImage.bind(_this2);
    _this2.handleUploadimage = _this2.handleUploadimage.bind(_this2);
    _this2.setImage = _this2.setImage.bind(_this2);
    _this2.getPersonDetails = _this2.getPersonDetails.bind(_this2);
    _this2.uploadDlg = null;
    _this2.camera = null;
    return _this2;
  }

  _createClass(Camera, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (this.camera) this.camera.click();
    }
  }, {
    key: 'putImage',
    value: function putImage(img, orientation) {
      console.log("putImage");
      var canvas = this.refs.photoCanvas;
      var ctx = canvas.getContext("2d");
      var w = img.width;
      var h = img.height;

      var _resizeImage = resizeImage(w, h),
          sw = _resizeImage.sw,
          sh = _resizeImage.sh;

      var tempCanvas = document.createElement('canvas');
      var tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = sw;
      tempCanvas.height = sh;
      tempCtx.drawImage(img, 0, 0, sw, sh);
      _imagetocanvas2.default.drawCanvas(canvas, img, orientation, sw, sh, 1, 0, false);
    }
  }, {
    key: 'takePhoto',
    value: function takePhoto(event) {
      var _this3 = this;

      var camera = this.refs.camera,
          files = event.target.files,
          file = void 0,
          w = void 0,
          h = void 0,
          mpImg = void 0,
          orientation = void 0;
      if (files && files.length > 0) {
        file = files[0];
        var fileReader = new FileReader();
        var putImage = this.putImage;
        fileReader.onload = function (event) {
          var img = new Image();
          img.src = event.target.result;
          var _this = _this3;
          img.onload = function () {
            getOrientation(file, function (orientation) {
              if (orientation < 0) orientation = 1;
              _this3.putImage(img, orientation);
              _this3.setState({ imageLoaded: true, clickedTheButton: true, currentImg: img.src });
              _this3.faceIdentify();
            });
          };
        };

        fileReader.readAsDataURL(file);
      }
    }
  }, {
    key: 'setImage',
    value: function setImage(file) {
      var _this4 = this;

      var camera = this.refs.camera,
          fileReader = new FileReader();
      fileReader.onload = function (event) {
        var img = new Image();
        img.src = event.target.result;
        var _this = _this4;
        img.onload = function () {
          _this4.setState({ currentImg: img.src });
        };
      };

      fileReader.readAsDataURL(file);

      //this.state.personDetails && this.state.personDetails.Name
    }
  }, {
    key: 'handleUploadimage',
    value: function handleUploadimage(e, id) {
      var _this5 = this;

      this.setState({
        spinnerDisplay: true,
        imageLoaded: false
      });

      var form_id = this.state.form_id;

      var file = e.target.files[0];
      var imageType = /image.*/;

      if (!file.type.match(imageType)) return;

      var form_data = new FormData();
      form_data.append('file', file);

      fetch('/verifyPhoto', {
        method: 'POST',
        body: form_data
      }).then(function (res) {
        return res.json();
      }, function (error) {
        return error.message;
      }).then(function (resp) {
        _this5.setState({
          personDetails: resp.persons[0],
          spinnerDisplay: false,
          imageLoaded: true,
          showMessageForm: true
        });
        // this.setImage(resp.person[0].Image)
      }).catch(function (error) {
        console.log(error);
      });
    }
  }, {
    key: 'faceIdentify',
    value: function faceIdentify() {
      var _this6 = this;

      var canvas = this.refs.photoCanvas;
      var dataURL = canvas.toDataURL();

      this.setState({
        spinnerDisplay: true,
        imageLoaded: false
      });

      // There's two ways to send images to the cognitive API.
      // 1. Send a Image URL (need to set Content-Type as application/json)
      // 2. Send a binary (need to set Content-Type as octet-stream). The image need to be serialized.
      _superagent2.default.post('https://westus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false').send(serializeImage(this.state.currentImg)).set('Content-Type', 'application/octet-stream')
      // .send({url: "http://techbeat.com/wp-content/uploads/2013/06/o-GOOGLE-FACIAL-RECOGNITION-facebook-1024x767.jpg"})
      // .set('Content-Type', 'application/json')
      .set('Ocp-Apim-Subscription-Key', '286fe5360c85463bac4315dff365fdc2').set('processData', false).set('Accept', 'application/json').end(function (err, res) {
        if (err || !res.ok) {
          console.error(err);
        } else {
          var faces = res.body.map(function (f) {
            return f.faceId;
          });

          _this6.setState({
            faces: faces
          });

          if (faces.length) {
            _this6.verifyFaces(faces);
          } else {
            _this6.setState({
              personDetails: { userData: 'No faces found' },
              spinnerDisplay: false,
              imageLoaded: true
            });
          }
        }
      });
    }
  }, {
    key: 'verifyFaces',
    value: function verifyFaces(faces) {
      var _this7 = this;

      console.log("verifyFaces");
      // NEEDS A PERSON GROUP
      this.setState({
        imageLoaded: false
      });

      var body = {
        "personGroupId": "aspc2017facegroup",
        "faceIds": faces,
        "maxNumOfCandidatesReturned": 1,
        "confidenceThreshold": 0.5
      };
      // console.log(body);
      _superagent2.default.post('https://westus.api.cognitive.microsoft.com/face/v1.0/identify').send(body).set('Content-Type', 'application/json').set('Ocp-Apim-Subscription-Key', '286fe5360c85463bac4315dff365fdc2').set('Accept', 'application/json').end(function (err, res) {
        if (err || !res.ok) {
          console.error(err);
        } else {
          if (res.body.length < 0) {
            _this7.setState({
              personDetails: { userData: 'No match found' },
              spinnerDisplay: false,
              imageLoaded: true
            });
          } else {
            if (res.body[0].candidates.length) {
              _this7.getPersonDetails(res.body[0].candidates[0].personId);
            } else {
              _this7.setState({
                personDetails: { userData: 'Face found, but it was not recognized' },
                spinnerDisplay: false,
                imageLoaded: true
              });
            }
          }
        }
      });
    }
  }, {
    key: 'getPersonDetails',
    value: function getPersonDetails(personId) {
      var _this8 = this;

      console.log("getPersonDetails");
      _superagent2.default.get('https://westus.api.cognitive.microsoft.com/face/v1.0/persongroups/aspc2017facegroup/persons/' + personId).set('Ocp-Apim-Subscription-Key', '286fe5360c85463bac4315dff365fdc2').set('Accept', 'application/json').end(function (err, res) {
        if (err || !res.ok) {
          console.error(err);
        } else {
          //RETURN PERSON DETAILS
          _this8.setState({
            personDetails: res.body,
            spinnerDisplay: false,
            imageLoaded: true
          });
        }
      });
    }
  }, {
    key: 'uploadImage',
    value: function uploadImage() {
      console.log("uploadImage");
      // store ID to FACE API
      var canvas = this.refs.photoCanvas;
      var dataURL = canvas.toDataURL();

      var userData = this.state.userData;


      _superagent2.default.post('https://westus.api.cognitive.microsoft.com/face/v1.0/facelists/aspc2017faces/persistedFaces?userData=' + JSON.stringify(userData)).send(serializeImage(this.state.currentImg)).set('Content-Type', 'application/octet-stream').set('Ocp-Apim-Subscription-Key', '286fe5360c85463bac4315dff365fdc2').set('Accept', 'application/json').end(function (err, res) {
        if (err || !res.ok) {
          console.error(err);
        } else {
          var data = JSON.stringify(res.body);
          //RETURNS A PERSISTED FACE ID
          console.log(data);
          alert(data);
          window.location.href = "/#uploaded";
        }
      });
    }
  }, {
    key: 'handleClick',
    value: function handleClick(e) {
      e.preventDefault();
      this.uploadDlg.click();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this9 = this;

      var canvasCSS = (0, _classnames2.default)({
        hidden: !this.state.imageLoaded,
        cameraFrame: true
      });

      var buttonCSS = (0, _classnames2.default)({
        hidden: this.state.clickedTheButton
      });

      var spinnerCSS = (0, _classnames2.default)({
        hidden: !this.state.spinnerDisplay
      });
      var innerSpinnerCSS = (0, _classnames2.default)({
        spinner: true
      });

      var addCSS = (0, _classnames2.default)({
        hidden: this.state.spinnerDisplay,
        metaInput: true

      });

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement('h1', { className: 'center light-color' }),
        _react2.default.createElement(
          'div',
          { className: 'center vertical-aligned' },
          _react2.default.createElement(
            'form',
            { method: 'post', encType: 'multipart/form-data',
              className: 'hide',
              onChange: function onChange(e) {
                e.preventDefault();
                _this9.setState({
                  clickedTheButton: true
                });
                _this9.handleUploadimage(e);
              },
              ref: function ref(el) {
                _this9.form = el;
              },
              action: '/upload' },
            _react2.default.createElement('input', { type: 'file', name: 'file',
              accept: '.jpg, .jpeg, .png', ref: function ref(el) {
                return _this9.uploadDlg = el;
              } }),
            _react2.default.createElement('input', { type: 'submit' })
          ),
          _react2.default.createElement(
            'div',
            { className: buttonCSS },
            _react2.default.createElement(
              'label',
              { className: 'camera-snap' },
              _react2.default.createElement('img', { src: '/assets/camera.svg', className: 'icon-camera', onClick: function onClick(e) {
                  return _this9.handleClick(e);
                },
                alt: 'Click to snap a photo or select an image from your photo roll' })
            )
          ),
          _react2.default.createElement(
            'div',
            { className: spinnerCSS },
            _react2.default.createElement(
              'div',
              { className: innerSpinnerCSS },
              _react2.default.createElement('div', { className: 'double-bounce1' }),
              _react2.default.createElement('div', { className: 'double-bounce2' })
            )
          ),
          _react2.default.createElement(
            'div',
            { className: addCSS },
            _react2.default.createElement(Debug, _extends({ visible: false }, this.state)),
            _react2.default.createElement(KingsMessageArea, { visible: this.state.showMessageForm,
              senderId: this.state.personDetails && this.state.personDetails.Id }),
            _react2.default.createElement(MessageSent, { visible: this.state.messageSent })
          )
        )
      );
    }
  }]);

  return Camera;
}(_react2.default.Component);

exports.default = Camera;

var MessageSent = function (_React$PureComponent) {
  _inherits(MessageSent, _React$PureComponent);

  function MessageSent() {
    _classCallCheck(this, MessageSent);

    return _possibleConstructorReturn(this, (MessageSent.__proto__ || Object.getPrototypeOf(MessageSent)).apply(this, arguments));
  }

  _createClass(MessageSent, [{
    key: 'render',
    value: function render() {
      if (!this.props.visible) {
        return null;
      }
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'div',
          { className: 'qr' },
          'viser qr kode'
        )
      );
    }
  }]);

  return MessageSent;
}(_react2.default.PureComponent);

var Debug = function (_React$PureComponent2) {
  _inherits(Debug, _React$PureComponent2);

  function Debug() {
    _classCallCheck(this, Debug);

    return _possibleConstructorReturn(this, (Debug.__proto__ || Object.getPrototypeOf(Debug)).apply(this, arguments));
  }

  _createClass(Debug, [{
    key: 'render',
    value: function render() {
      if (!this.props.visible) {
        return null;
      }
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'div',
          { className: 'personDetails' },
          this.props.personDetails && this.props.personDetails.Name
        ),
        _react2.default.createElement(
          'div',
          { className: 'personDetails' },
          this.props.personDetails && this.props.personDetails.UserData
        ),
        _react2.default.createElement(
          'div',
          { className: 'personDetails' },
          this.props.personDetails && this.props.personDetails.Id
        ),
        _react2.default.createElement(
          'div',
          { className: 'personDetails' },
          this.props.personDetails && this.props.personDetails.Emotion
        ),
        _react2.default.createElement(
          'div',
          { className: 'personDetails' },
          this.props.personDetails && this.props.personDetails.Age
        ),
        _react2.default.createElement(
          'div',
          { className: 'personDetails' },
          this.props.personDetails && this.props.personDetails.Gender
        )
      );
    }
  }]);

  return Debug;
}(_react2.default.PureComponent);

var KingsMessageArea = function (_React$PureComponent3) {
  _inherits(KingsMessageArea, _React$PureComponent3);

  function KingsMessageArea() {
    _classCallCheck(this, KingsMessageArea);

    var _this12 = _possibleConstructorReturn(this, (KingsMessageArea.__proto__ || Object.getPrototypeOf(KingsMessageArea)).call(this));

    _this12.state = {
      messengers: []
    };
    _this12.qrcanvas = null;
    _this12.form = null;
    _this12.qrimg = null;
    return _this12;
  }

  _createClass(KingsMessageArea, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var _this13 = this;

      fetch("/messengers").then(function (data) {
        return data.json();
      }).then(function (resp) {
        _this13.setState({
          messengers: resp.persons
        });
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this14 = this;

      var spinnerCSS = (0, _classnames2.default)({
        hidden: !this.state.spinnerDisplay
      });
      var innerSpinnerCSS = (0, _classnames2.default)({
        spinner: true
      });

      if (!this.props.visible) {
        return null;
      }
      return _react2.default.createElement(
        'div',
        { className: "kingsmessage" },
        _react2.default.createElement(
          'div',
          { className: spinnerCSS },
          _react2.default.createElement(
            'div',
            { className: innerSpinnerCSS },
            _react2.default.createElement('div', { className: 'double-bounce1' }),
            _react2.default.createElement('div', { className: 'double-bounce2' })
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'qrcanvas' },
          _react2.default.createElement(
            'canvas',
            { ref: function ref(e) {
                return _this14.qrcanvas = e;
              }, className: 'qrCanvas' },
            'Your browser does not support the HTML5 canvas tag.'
          ),
          _react2.default.createElement('img', { src: '/assets/transparent.png', ref: function ref(e) {
              _this14.qrimg = e;
            } })
        ),
        _react2.default.createElement(
          'form',
          { ref: function ref(e) {
              return _this14.form = e;
            } },
          _react2.default.createElement('input', { type: "hidden", name: "senderId", value: this.props.senderId }),
          _react2.default.createElement(
            'label',
            { htmlFor: "message" },
            'Your message'
          ),
          _react2.default.createElement('textarea', { name: "message", className: "melding", defaultValue: "Kill the imp!" }),
          _react2.default.createElement(
            'label',
            { htmlFor: "messengers" },
            'Choose your messenger'
          ),
          _react2.default.createElement(
            'select',
            { name: "messengers" },
            this.state.messengers.filter(function (m) {
              return m.Type !== "King";
            }).map(function (m) {
              return _react2.default.createElement(
                'option',
                { key: uuid.v4(), value: m.Id },
                'Peasant ',
                m.Name
              );
            })
          ),
          _react2.default.createElement(
            'label',
            { htmlFor: "receivers" },
            'Whom shall receive the message?'
          ),
          _react2.default.createElement(
            'select',
            { name: "receivers" },
            this.state.messengers.filter(function (m) {
              return m.Type === "King";
            }).map(function (m) {
              return _react2.default.createElement(
                'option',
                { key: uuid.v4(), value: m.Id },
                'King ',
                m.Name
              );
            })
          ),
          _react2.default.createElement('label', { htmlFor: "send" }),
          _react2.default.createElement('input', { type: "button", name: "send", onClick: function onClick(e) {
              e.preventDefault();
              _this14.setState({
                spinnerDisplay: true,
                showMessageForm: false
              });
              _this14.form.style.display = "none";
              // createTransaction(e)
              //   .then(transactionResponse => {
              //     console.log("transacton response", transactionResponse)
              //   })
              sendMessage(e).then(function (data) {
                return data.blob();
              }).then(function (blob) {
                _this14.setState({
                  spinnerDisplay: false
                });

                //todo fix canvas scale
                // this.qrcanvas.style.display = "initial"
                toCanvas(blob, _this14.qrcanvas, _this14.qrimg);
              });
            }, className: "send", defaultValue: "Send!" })
        )
      );
    }
  }]);

  return KingsMessageArea;
}(_react2.default.PureComponent);

var toCanvas = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(blob, canvas, qrimg) {
    var ctx, img, dataurl;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            img = new Image();

            img.onload = function () {
              ctx.drawImage(img, 0, 0, 400, 400);
            };
            _context.next = 6;
            return blobToDataURL(blob);

          case 6:
            dataurl = _context.sent;

            img.src = dataurl;
            qrimg.src = dataurl;
            // qrimg = dataurl

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function toCanvas(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var blobToDataURL = function blobToDataURL(blob) {
  return new Promise(function (resolve) {
    var a = new FileReader();
    a.onload = function (e) {
      resolve(e.target.result);
    };
    a.readAsDataURL(blob);
  });
};

/***/ }),

/***/ 497:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(204);
module.exports = __webpack_require__(203);


/***/ })

},[497]);