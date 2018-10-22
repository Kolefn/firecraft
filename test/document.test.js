var document = require('../lib/functions/firestore/document');
var chai = require('chai');
chai.should();


describe('firestore.document', function(){

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

  describe('#instance()', function(){
    it('should at least return a copy of the document object', function(){
      temp.instance().should.be.an.instanceOf(document).with.property('path', temp.path);
    });

    it('should return a new document with provided arguments in place of path parameters', function(){
      temp.instance({userId: 'kole', characterId: 'zabeebo'}).should.be.an.instanceOf(document).with.property("path", "users/kole/characters/zabeebo");
    });
  });
})
