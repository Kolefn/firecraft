const path = require('../lib/firestore/path');
const reference = require('../lib/firestore/reference');
const chai = require('chai');
chai.should();


describe('reference', function(){
  describe('#parse()', function(){
    it('should get a DocumentReference from a document path', function(){
      reference.parse(new path('users/kole')).constructor.name.should.equal('DocumentReference');
    });
    it('should get a CollectionReference from a collection path', function(){
      reference.parse(new path('users/kole/characters')).constructor.name.should.equal('CollectionReference');
    });

    it('should throw an error if parameters are in path', function(){
      chai.expect(()=> reference.parse(new path('users/{userId}'))).to.throw();
    });
  });
});
