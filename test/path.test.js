const path = require('../lib/firestore/path');
const chai = require('chai');
chai.should();
describe('path', function(){
  var sample;
  describe('#constructor()', function(){
    it('should create a new path object', function(){
      sample = new path('users/{userId}/characters/{characterId}');
      sample.should.be.an.instanceOf(path);
    });
  });
  describe('#isEven', function(){
    it('should return the proper boolean value', function(){
      chai.expect(sample.isEven).to.be.ok;
      chai.expect(new path('users').isEven).to.not.be.ok;
    });
  });
  describe('#end', function(){
    it('should return the last segment string', function(){
      sample.end.should.equal('{characterId}');
    });
  });
  describe('#getSegments()', function(){
    it('should return a COPY of the internal path segments array', function(){
      sample.getSegments().should.be.satisfy(Array.isArray);
      let length = sample._segments.length;
      sample.getSegments().pop();
      sample._segments.should.have.lengthOf(length);
    });
  });
  describe('#child()', function(){
    it('should return a new path with the proper string extension', function(){
      sample.child('traits/{traitId}').should.be.an.instanceOf(path).with.property('_string', sample.toString() + "/" + 'traits/{traitId}');
    });
  });
  describe('#parent()', function(){
    it('should return a new path with the proper string reduction', function(){
      sample.parent().should.be.an.instanceOf(path).with.property('_string', 'users/{userId}/characters');
    });
  });
  describe('#equalTo', function(){
    it('should return true if paths are the same', function(){
      let same = sample;
      chai.expect(sample.equalTo(same)).to.be.true;
    });
    it('should return false if paths are different', function(){
      let other = new path('users/{userId}/achievements/{achievementId}');
      chai.expect(sample.equalTo(other)).to.be.false;
    });
    it('should return false if path is invalid', function(){
      chai.expect(sample.equalTo(null)).to.be.false;
      chai.expect(sample.equalTo(3)).to.be.false;
    });
  });
  describe('#toString()', function(){
    it('should return the internal path string', function(){
      sample.toString().should.be.a('string').equal(sample._string);
    });
  });
  describe('#insertArgs()', function(){
    it('should return a new path with parameters replaced with data', function(){
      new path('col/{docId}/list/{itemId}').insertArgs({userId: 'zach123', achievementId: 'highscore'}, {docId: 'userId', itemId: 'achievementId'})
        .should.be.an.instanceOf(path).with.property("_string", "col/zach123/list/highscore");
    });
    it('should return a copy if no args input provided', function(){
      new path('users/{userId}').insertArgs().should.be.an.instanceOf(path).with.property("_string", 'users/{userId}');
    });
  });
});
