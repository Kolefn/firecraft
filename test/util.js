var util = require('../lib/functions/util');
var chai = require('chai');
chai.use(require("chai-as-promised"));
chai.should();


describe('util', function(){
  describe('#extractPathParams()', function(){

    it('should return a map of params', function(){
      util.extractPathParams('root/{childId}').should.have.all.keys('childId');
      util.extractPathParams('path/{to}/really/{far}/down/{document}').should.have.all.keys('to', 'far', 'document');
    });

    it('should return empty object with nil input.', function(){
      util.extractPathParams().should.be.a('object');
    });

    it('should handle mis-formatted path', function(){
      util.extractPathParams('path}/{to}/re{ally}/{}/far/{').should.have.all.keys('to', 'ally', '');
    });

  });
});
