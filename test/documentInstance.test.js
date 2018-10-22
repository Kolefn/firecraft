const instance = require('../lib/functions/firestore/document/documentInstance');
const chai = require('chai');
chai.should();


describe("documentInstance", function(){
  describe("#constructor()", function(){
    it('should return a documentInstance', function(){
      new instance('collection/user123').should.be.an.instanceOf(instance);
    });

    it('should throw if path includes parameters', function(){
      chai.expect(()=> new instance('collection/{userId}')).to.throw().with.property('message', instance.errors.paramInPath.message);
    });

    it('should throw if path is invalid', function(){
      chai.expect(()=> new instance('collection/user123/characters')).to.throw().with.property('message', instance.errors.badPath.message);
    });
  });
});
