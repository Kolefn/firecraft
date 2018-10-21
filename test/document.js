var document = require('../lib/functions/firestore/collection/document');
var chai = require('chai');
chai.use(require("chai-as-promised"));
chai.should();


describe('document', function(){

  var temp;

  describe('#constructor()', function(){
    it('should create a valid document object.', function(){
      temp = new document('path/to/collection/and/document');
      temp.should.be.an.instanceOf(document);
    });
  });

  describe('#node()', function(){
    it('should create a new function of the given name.', function(){
      document.node('test', ()=> 1);
      temp.test.should.be.a('function');
    });

    it('should create a new function that returns properly.', function(){
      temp.test().should.equal(1);
    });

    it('should provide document instance as first argument.', function(){
      document.node('test', (doc)=> doc.should.be.an.instanceOf(document));
      temp.test(1,2,3);
    });
  });

  describe('#instance', function(){
    it('should return the STATIC intance class', function(){
      document.instance.should.not.be.an.instanceOf(document.instance);
      document.instance.prototype.constructor.name.should.equal('instance');
    });
  });
})
