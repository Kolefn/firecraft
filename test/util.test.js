const util = require('../lib/firestore/util');
const chai = require('chai');
chai.should();
describe('util', function(){
  describe('#extractData', function(){
    it('should return internal data of Change object.', function(){
      let update = {after: { data: ()=> 3}};
      util.extractData(update).should.equal(3);
      let create = {before: {data: ()=> 5}};
      util.extractData(create).should.equal(5);
    });
    it('should return internal data of DocumentSnapshot', function(){
      let snap = { data: ()=> 2};
      util.extractData(snap).should.equal(2);
    });
    it('should return plain Object if passed one.', function(){
      let obj = {sum: 10};
      util.extractData(obj).should.have.property("sum", 10);
    });
    it('should return null if argument null or undefined', function(){
      let dummy = {result0: util.extractData(null), result1: util.extractData(undefined)};
      dummy.should.have.property("result0", null);
      dummy.should.have.property("result1", null);
    });
    it('should extract snapshot or change objects and assign context params', function(){
      let obj = {snapshot: {data: ()=> { return {timestamp: new Date()} } }, context: {params: {userId: 'kolefn'}}};
      let data = util.extractData(obj);
      data.should.have.property('userId', 'kolefn');
      data.should.have.property('timestamp');
    });
  });
  describe('#computeTransactionUpdateObject()', function(){
    it('should support simple integer values', function(){
      let delta = {score: 3, damage: 1000, accuracy: -0.2};
      let base = {score: 80, damage: 24000, accuracy: 0.9};
      let update = util.computeTransactionUpdateObject(delta, base);
      update.should.have.property("score", 83);
      update.should.have.property("damage", 25000);
      update.should.have.property("accuracy", 0.7);
    });
    it('should support nested objects', function(){
      let delta = {stats: {score: 3, damage: 1000, accuracy: -0.2, coords: {x: 3, y: -1}}};
      let base = {stats: {score: 80, damage: 24000, accuracy: 0.9, coords: {x: 33, y: -8}}};
      let update = util.computeTransactionUpdateObject(delta, base);
      update.stats.should.have.property("score", 83);
      update.stats.should.have.property("damage", 25000);
      update.stats.should.have.property("accuracy", 0.7);
      update.stats.coords.should.have.property("x", 36);
      update.stats.coords.should.have.property("y", -9);
    });
    it('should support arrays of integers', function(){
      let delta = {talents: [0,1,0,1], selections: [0,0,1]};
      let base = {talents: [3,1,0,1], selections: [1,2]};
      let update = util.computeTransactionUpdateObject(delta, base);
      update.talents.should.deep.equal([3,2,0,2]);
      update.selections.should.deep.equal([1,2,1]);
    });
    it('should support nil base properties', function(){
      let delta = {score: 3, damage: 500, accuracy: -0.2};
      let base = {accuracy: 0.9};
      let update = util.computeTransactionUpdateObject(delta, base);
      update.should.have.property("score", 3);
      update.should.have.property("damage", 500);
      update.should.have.property("accuracy", 0.7);
    });
  });
});
