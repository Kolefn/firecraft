const {collection, document} = require('../lib/firestore');
const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.should();


describe('firestore.document', function(){

  var characterDoc;

  describe('#constructor()', function(){
    it('should throw bad path error if provided path is invalid', function(){
      chai.expect(()=> new document('users')).to.throw().with.property('message', document.errors.badPath.message);
    });

    it('should create a valid document object.', function(){
      characterDoc = new document('users/{userId}/characters/{characterId}');
      characterDoc.should.be.an.instanceOf(document);
    });
  });

  describe('#parent', function(){
    it('should return the parent collection object after first and consequtive uses.', function(){
      characterDoc.parent.should.be.an.instanceOf(collection).with.property('path', 'users/{userId}/characters');
      characterDoc.parent.should.be.an.instanceOf(collection);
    });
  });

  describe('#extend()', function(){
    it('should return a collection if input path has odd segments', function(){
      characterDoc.extend('traits').should.be.an.instanceOf(collection);
    });

    it('should return a document if input path has even segments', function(){
      characterDoc.extend('traits/{traitId}').should.be.an.instanceOf(document);
    });

    it('should throw if a path input is not a string', function(){
      chai.expect(characterDoc.extend.bind(characterDoc, null)).to.throw().with.property('message', document.errors.badPath.message);
    });
  });

  describe('#node()', function(){
    it('should create a new function of the given name.', function(){
      document.node('test', ()=> 1);
      characterDoc.test.should.be.a('function');
    });

    it('should create a new function that returns properly.', function(){
      characterDoc.test().should.equal(1);
    });

    it('should provide document instance as first argument.', function(){
      document.node('test', (specialCharacter)=> specialCharacter.should.be.an.instanceOf(document));
      characterDoc.test(1,2,3);
    });
  });

  describe('#instance()', function(){
    it('should at least return a copy of the document object', function(){
      characterDoc.instance().should.be.an.instanceOf(document).with.property('path', characterDoc.path);
    });

    it('should return a new document with provided arguments in place of path parameters', function(){
      characterDoc.instance({userId: 'kole', characterId: 'zabeebo'}).should.be.an.instanceOf(document).with.property("path", "users/kole/characters/zabeebo");
    });
  });

  describe('#onCreate()', function(){
    it('should throw if handler is nil or not a function', function(){
      chai.expect(characterDoc.onCreate.bind(characterDoc, null)).to.throw().with.property('message', document.errors.badTriggerInput.message);
      chai.expect(characterDoc.onCreate.bind(characterDoc, 'notafunction')).to.throw().with.property('message', document.errors.badTriggerInput.message);
    });

    it("should return the same document instance", function(){
      characterDoc.onCreate(()=> 1).should.equal(characterDoc);
    });

    it("should append handler to ongoing onCreate handlers", function(){
      let sayHello = ()=> "hello world";
      characterDoc.onCreate(sayHello);
      characterDoc._onCreateHandlers.pop().should.equal(sayHello);
    });
  });

  describe('#onDelete()', function(){
    it('should throw if handler is nil or not a function', function(){
      chai.expect(characterDoc.onDelete.bind(characterDoc, null)).to.throw().with.property('message', document.errors.badTriggerInput.message);
      chai.expect(characterDoc.onDelete.bind(characterDoc, 'notafunction')).to.throw().with.property('message', document.errors.badTriggerInput.message);
    });

    it("should return the same document instance", function(){
      characterDoc.onDelete(()=> 1).should.equal(characterDoc);
    });

    it("should append handler to ongoing onDelete handlers", function(){
      let sayHello = ()=> "hello world";
      characterDoc.onDelete(sayHello);
      characterDoc._onDeleteHandlers.pop().should.equal(sayHello);
    });
  });

  describe('#onUpdate()', function(){
    it('should throw if handler is nil or not a function', function(){
      chai.expect(characterDoc.onUpdate.bind(characterDoc, null)).to.throw().with.property('message', document.errors.badTriggerInput.message);
      chai.expect(characterDoc.onUpdate.bind(characterDoc, 'notafunction')).to.throw().with.property('message', document.errors.badTriggerInput.message);
    });

    it("should return the same document instance", function(){
      characterDoc.onUpdate(()=> 1).should.equal(characterDoc);
    });

    it("should append handler to ongoing onUpdate handlers", function(){
      let sayHello = ()=> "hello world";
      characterDoc.onUpdate(sayHello);
      characterDoc._onUpdateHandlers.pop().should.equal(sayHello);
    });
  });

  describe('#onWrite()', function(){
    it('should throw if handler is nil or not a function', function(){
      chai.expect(characterDoc.onWrite.bind(characterDoc, null)).to.throw().with.property('message', document.errors.badTriggerInput.message);
      chai.expect(characterDoc.onWrite.bind(characterDoc, 'notafunction')).to.throw().with.property('message', document.errors.badTriggerInput.message);
    });

    it("should return the same document instance", function(){
      characterDoc.onWrite(()=> 1).should.equal(characterDoc);
    });

    it("should append handler to ongoing onWrite handlers", function(){
      let sayHello = ()=> "hello world";
      characterDoc.onWrite(sayHello);
      characterDoc._onWriteHandlers.pop().should.equal(sayHello);
    });
  });

  var specialCharacter;
  describe('#get()', function(){
    before(function(){
      specialCharacter = characterDoc.instance({userId: 'kole', characterId: 'zabeebo'});
      return true;
    });

    it('should return a promise which resolves', function(){
      return specialCharacter.get().should.be.fulfilled;
    });

    it('should return an object with standard properties', function(){
      return specialCharacter.get().should.eventually.respondTo('data');
    });

  });

  describe('#set()', function(){
    it('should return a promise which resolves', function(){
      return specialCharacter.set({timestamp: new Date()}).should.be.fulfilled;
    });

    it('should write proper data to the database', function(){
        return specialCharacter.get().should.eventually.satisfy(function(specialCharacter){
          return specialCharacter.data().timestamp.constructor.name.should.equal('Timestamp');
        });
    });

    // it('should write to a batch if batch is included in options.', function(){
    //     let batch =
    //     return specialCharacter.set({batchTest: true});
    // });
  });


  describe("#reference", function(){
    it('should throw if a parameter is in provided path.', function(){
      chai.expect(()=> characterDoc.reference).to.throw().with.property('message', document.errors.badReferencePath.message);
    });

    it('should return a standard firestore document reference object', function(){
      specialCharacter.reference.should.respondTo('collection');
      specialCharacter.reference.should.have.property('id', 'zabeebo');
    });

  });

});
