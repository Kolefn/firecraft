var firestore = require('../lib/functions/firestore');
var chai = require('chai');
chai.use(require("chai-as-promised"));
chai.should();

describe('firestore', function(){
  describe('#createDocuments()', function(){
    it('should produce an object for each path supplied.', function(){
      return firestore.createDocuments({doc1: 'first/{path}', doc2: 'second/{path}'}).should.have.all.keys('doc1', 'doc2');
    });

    it('should produce valid document objects', function(){
      return firestore.createDocuments({doc1: 'col/{docId}'}).doc1.should.be.an.instanceOf(firestore.collection.document);
    });
  });
})
