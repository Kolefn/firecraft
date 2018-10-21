var collection = require('../lib/functions/firestore/collection');
var chai = require('chai');
chai.use(require("chai-as-promised"));
chai.should();


describe('collection', function(){

  var temp;

  describe('#constructor()', function(){
    it('should create a valid collection object.', function(){
      temp = new collection('path/to/collection');
      temp.should.be.an.instanceOf(collection);
    });
  });

  describe('#node()', function(){
    it('should create a new function of the given name.', function(){
      collection.node('test', ()=> 1);
      temp.test.should.be.a('function');
    });

    it('should createa a new function that returns properly.', function(){
      temp.test().should.equal(1);
    });

    it('should provide collection instance as first argument.', function(){
      collection.node('test', (doc)=> doc.should.be.an.instanceOf(collection));
      temp.test(1,2,3);
    });
  });

  describe('#instance', function(){
    it('should return the STATIC intance class', function(){
      collection.instance.should.not.be.an.instanceOf(collection.instance);
      collection.instance.prototype.constructor.name.should.equal('instance');
    });
  });

  describe('#document', function(){
    it('should return the STATIC document class', function(){
      collection.document.should.not.be.an.instanceOf(collection.document);
      collection.document.prototype.constructor.name.should.equal('document');
    });
  });
})
