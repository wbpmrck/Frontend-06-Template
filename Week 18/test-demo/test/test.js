var assert = require('assert');
// var add = require('../add').add;
// var mul = require('../add').mul;
import {add,mul} from '../add';

describe('add testing', () => {
  
  it('1 + 1 = 2', () => {
    assert.equal(add(1,2), 3);
  });

  it('-5 + 2 = -3', () => {
    assert.equal(add(-5,2), -3);
  });
  it('-5 * 2 = -10', () => {
    assert.equal(mul(-5,2), -10);
  });

});