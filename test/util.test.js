const { util } = require('../lib/functions');
var chai = require('chai');
chai.should();


describe("functions.util", function(){
  describe("#node()", function(){
    it('should define a new function', function(){
      util.node('test', ()=> 1);
      util.test.should.be.a('function');
    });

    it('should define a new a function that returns defined value', function(){
      util.test().should.equal(1);
    });
  });
});
