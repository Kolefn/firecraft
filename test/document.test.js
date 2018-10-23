var document = require('../lib/firestore/document');
var chai = require('chai');
chai.use(require('chai-as-promised'));
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

  describe('#onCreate()', function(){
    it('should throw if handler is nil or not a function', function(){
      chai.expect(temp.onCreate.bind(temp, null)).to.throw().with.property('message', document.errors.badTriggerInput.message);
      chai.expect(temp.onCreate.bind(temp, 'notafunction')).to.throw().with.property('message', document.errors.badTriggerInput.message);
    });

    it("should return the same document instance", function(){
      temp.onCreate(()=> 1).should.equal(temp);
    });

    it("should append handler to ongoing onCreate handlers", function(){
      let sayHello = ()=> "hello world";
      temp.onCreate(sayHello);
      temp._onCreateHandlers.pop().should.equal(sayHello);
    });
  });

  describe('#onDelete()', function(){
    it('should throw if handler is nil or not a function', function(){
      chai.expect(temp.onDelete.bind(temp, null)).to.throw().with.property('message', document.errors.badTriggerInput.message);
      chai.expect(temp.onDelete.bind(temp, 'notafunction')).to.throw().with.property('message', document.errors.badTriggerInput.message);
    });

    it("should return the same document instance", function(){
      temp.onDelete(()=> 1).should.equal(temp);
    });

    it("should append handler to ongoing onDelete handlers", function(){
      let sayHello = ()=> "hello world";
      temp.onDelete(sayHello);
      temp._onDeleteHandlers.pop().should.equal(sayHello);
    });
  });

  describe('#onUpdate()', function(){
    it('should throw if handler is nil or not a function', function(){
      chai.expect(temp.onUpdate.bind(temp, null)).to.throw().with.property('message', document.errors.badTriggerInput.message);
      chai.expect(temp.onUpdate.bind(temp, 'notafunction')).to.throw().with.property('message', document.errors.badTriggerInput.message);
    });

    it("should return the same document instance", function(){
      temp.onUpdate(()=> 1).should.equal(temp);
    });

    it("should append handler to ongoing onUpdate handlers", function(){
      let sayHello = ()=> "hello world";
      temp.onUpdate(sayHello);
      temp._onUpdateHandlers.pop().should.equal(sayHello);
    });
  });

  describe('#onWrite()', function(){
    it('should throw if handler is nil or not a function', function(){
      chai.expect(temp.onWrite.bind(temp, null)).to.throw().with.property('message', document.errors.badTriggerInput.message);
      chai.expect(temp.onWrite.bind(temp, 'notafunction')).to.throw().with.property('message', document.errors.badTriggerInput.message);
    });

    it("should return the same document instance", function(){
      temp.onWrite(()=> 1).should.equal(temp);
    });

    it("should append handler to ongoing onWrite handlers", function(){
      let sayHello = ()=> "hello world";
      temp.onWrite(sayHello);
      temp._onWriteHandlers.pop().should.equal(sayHello);
    });
  });

  var doc;
  describe('#get()', function(){
    before(function(){
      doc = temp.instance({userId: 'kole', characterId: 'zabeebo'});
    });

    it('should return a promise which resolves', function(){
      return doc.get().should.be.fulfilled;
    });

    it('should return an object with standard properties', function(){
      return doc.get().should.eventually.have.all.keys(['id', 'exists', 'data', 'ref']);
    });

  });

  describe('#set()', function(){
    it('should return a promise which resolves', function(){
      return doc.set({timestamp: new Date()}).should.be.fulfilled;
    });

    it('should write proper data to the database', function(){
        return doc.get().should.eventually.satisfy(function(doc){
          return doc.data().userId == 'kole' && doc.data().characterId == 'zabeebo';
        });
    });
  });

});
