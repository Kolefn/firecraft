var firestore = require('../lib/functions/firestore');
var chai = require('chai');
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

  describe('#export()', function(){
    var documents;
    before(function(){
        documents = firestore.createDocuments({user: 'users/{userId}'});
    });

    it('should return a map of firestore cloud functions', function(){
      let sayHello = ()=> 'hello world';
      documents.user.onCreate(sayHello);
      firestore.export().userOnCreate.should.be.a('function');
    });
  });
})
