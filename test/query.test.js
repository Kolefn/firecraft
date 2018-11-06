const {collection, document} = require('../lib/firestore');
const query = require('../lib/firestore/query');
const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.should();


describe('query', function(){

  describe('#constructor()', function(){
    it('should accept orderBy options in the format of ["timestamp", "asc"]');
    it('should accept where options in the format of ["votes", ">", 10]');
    it('should accept cursors in the format of either {startAfter: DocumentSnapshot/orderByFieldData}');
  });

  describe('#get()', function(){
    it('should return a promise which resolves with a QuerySnapshot matching the set query options', function(){
      let col = new collection("users/kole/characters");
      let qry = new query(col.reference, {orderBy: ['timestamp', 'asc']});
      qry.get().should.be.fulfilled;
    });
  });

  describe('#startAfter()', function(){
    it('should accept a DocumentSnapshot and parse it appropriately considering orderBy setting.');
  });

  describe('#access', function(){
    it('should return a Firestore Query object (child of CollectionReference)');
  });
});
