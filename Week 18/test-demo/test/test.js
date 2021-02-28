var assert = require('assert');
var add = require('../add');

describe('add testing', () => {
  
  it('1 + 1 = 2', () => {
    assert.equal(add(1,2), 3);
  });

  it('-5 + 2 = -3', () => {
    assert.equal(add(-5,2), -3);
  });

});