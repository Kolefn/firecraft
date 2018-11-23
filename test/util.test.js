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
});
