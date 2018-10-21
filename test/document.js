var document = require('../lib/functions/firestore/document');
var chai = require('chai');
chai.use(require("chai-as-promised"));
chai.should();


describe('document', function(){

  var temp;

  describe('#constructor()', function(){
    it('should throw bad path error if provided path is invalid', function(){
      chai.expect(()=> new document('users')).to.throw().with.property('message', document.errors.badPath.message);
    });

    it('should create a valid document object.', function(){
      temp = new document('users/{userId}/characters/{characterId}');
      temp.should.be.an.instanceOf(document);
    });

    it('should set the proper parameters', function(){
      temp.params.should.have.all.keys('userId', 'characterId');
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
    it('should reference the STATIC intance class', function(){
      document.instance.should.not.be.an.instanceOf(document.instance);
      document.instance.prototype.constructor.name.should.equal('instance');
    });
  });

  describe('#instance()', function(){
    it('should return a new documentInstance object', function(){
      temp.instance({userId: 'kole', characterId: 'zabeebo'}).should.be.an.instanceOf(document.instance);
    });
  });

  describe('#isValidPath', function(){
    it('should return true for valid paths', function(){
      document.isValidPath('collection/{docId}').should.be.ok;
      document.isValidPath('collection/{docId}/col/{documentId}').should.be.ok;
    });

    it('should return false for invalid paths', function(){
      document.isValidPath('collection').should.not.be.ok;
      document.isValidPath('collection/{docId}/col').should.not.be.ok;
      document.isValidPath(null).should.not.be.ok;
    });
  });
})
