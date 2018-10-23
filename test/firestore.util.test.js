const { util } = require('../lib/firestore');
const chai = require('chai');
chai.should();


describe('firestore.util', function(){
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

  describe('#injectPathArgs()', function(){
    it('should return the correct path granted a valid template path and args.', function(){
      util.injectPathArgs('collection/{documentId}/secondaryCollection/{secondaryDocumentId}', {
        documentId: 'd123',
        secondaryDocumentId: 'a123'
      }).should.equal('collection/d123/secondaryCollection/a123');
    });

    it('should reference map if args are missing.', function(){
      util.injectPathArgs('col/{docId}/list/{listItemId}',
        {userId: 'zach123', achievementId: 'highscore'},
        {docId: 'userId', listItemId: 'achievementId'});
    });

    it('should throw if argument not provided', function(){
      util.injectPathArgs.bind(util.injectPathArgs, 'collection/{documentId}').should.throw().with.property('message', util.errors.injectNilArg.message);
    });

    it('should return empty string if no path provided.', function(){
      util.injectPathArgs().should.equal("");
    });
  });

  describe('#isValidPath()', function(){
    it('should return true for valid document paths', function(){
      util.isValidPath('collection/{docId}').should.be.ok;
      util.isValidPath('collection/{docId}/col/{documentId}').should.be.ok;
    });

    it('should return false for invalid document paths', function(){
      util.isValidPath('collection').should.not.be.ok;
      util.isValidPath('collection/{docId}/col').should.not.be.ok;
      util.isValidPath(null).should.not.be.ok;
    });

    it('should return false for valid document paths when false provided for even parameter.', function(){
      util.isValidPath('collection/{docId}', false).should.not.be.ok;
      util.isValidPath('collection/{docId}/col/{documentId}', false).should.not.be.ok;
    });

    it('should return true for collection paths when false provided for even param.', function(){
      util.isValidPath('collection', false).should.be.ok;
      util.isValidPath('collection/{docId}/col', false).should.be.ok;
    });
  });

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
