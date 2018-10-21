var firestore = require('../lib/functions/firestore');
var chai = require('chai');
chai.use(require("chai-as-promised"));
chai.should();

describe('firestore', function(){
  describe('#createDocuments()', function(){
    it('should produce an object for each path supplied.', function(){
      return firestore.createDocuments({doc1: 'path1', doc2: 'path2'}).should.have.all.keys('doc1', 'doc2');
    });

    it('should produce valid document objects', function(){
      return firestore.createDocuments({doc1: 'path1'}).doc1.should.be.an.instanceOf(firestore.collection.document);
    });
  });
})
