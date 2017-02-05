const assert = require('assert');
const path = require('path');
const fs = require('fs');
const resizeImage = require(path.join('..','src','helperfncs')).resizeImage;

describe('test image functions', function () {

  it('should provide correct aspect ratios for a resized portrait image', function () {
    const {sw, sh} = resizeImage(3264,2448);
    assert.equal(sw,600);
    assert.equal(sh,450);
  });

  it('should provide correct aspect ratios for a resized landscape image', function () {
    const {sw, sh} = resizeImage(1280,1920);
    assert.equal(sw,400);
    assert.equal(sh,600);
  })

});
