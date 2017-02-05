const assert = require('assert');
const path = require('path');
const fs = require('fs');
const {resizeImage} = require(path.join('..','src','helperfncs'));

describe('test image functions', function () {

  it('should resize images with correct aspect ratios', function () {
    const {sw, sh} = resizeImage(3264,2448);
    assert.equal(sw,600);
    assert.equal(sh,450);
  })

});
