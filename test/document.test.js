const {collection, document, batch} = require('../lib/firestore');
const reference = require('../lib/firestore/reference');
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
    it('should return the parent collection object', function(){
      let parent = characterDoc.parent;
      parent.should.be.an.instanceOf(collection);
      parent._path.should.have.property('_string', 'users/{userId}/characters');
    });
  });
  describe('#collection()', function(){
    it('should return a collection object', function(){
      characterDoc.collection('traits').should.be.an.instanceOf(collection);
      characterDoc.collection('traits/{traitId}/statistics').should.be.an.instanceOf(collection);
    });
    it('should throw if relative path does not point to a colleciton', function(){
      chai.expect(()=> characterDoc.collection('traits/{traitId}')).to.throw();
    });
  });
  describe('#instance()', function(){
    it('should at least return a copy of the document object', function(){
      let instance = characterDoc.instance();
      instance.should.be.an.instanceOf(document);
      instance._path.should.have.property('_string', characterDoc._path._string);
    });
    it('should return a new document with provided arguments in place of path parameters', function(){
      let specialCharacter = characterDoc.instance({userId: 'kole', characterId: 'zabeebo'});
      specialCharacter.should.be.an.instanceOf(document);
      specialCharacter._path.should.have.property("_string", "users/kole/characters/zabeebo");
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
  describe('#set()', function(){
    before(function(){
      specialCharacter = characterDoc.instance({userId: 'kole', characterId: 'zabeebo'});
      return true;
    });
    it('should return a promise which resolves', function(){
      return specialCharacter.set({timestamp: new Date()}).should.be.fulfilled;
    });
    it('should write proper data to the database', function(){
        return specialCharacter.get().should.eventually.satisfy(function(specialCharacter){
          return specialCharacter.data().timestamp.constructor.name.should.equal('Timestamp');
        });
    });
    it('should add set to provided batch', function(){
      let b = new batch();
      specialCharacter.set({batchSet: new Date()}, {batch: b}).should.be.fulfilled;
      b.writes.should.equal(1);
    });
  });
  describe('#get()', function(){
    it('should return a promise which resolves', function(){
      return specialCharacter.get().should.be.fulfilled;
    });
    it('should return an object with standard properties', function(){
      return specialCharacter.get().should.eventually.respondTo('data');
    });
  });
  describe('#update()', function(){
    let rand;
    //let specialCharacter = new document('users/kole/characters/zabeebo');
    it('should return a promise which resolves', function(){
      rand = Math.random().toFixed(4);
      return specialCharacter.update({updated: rand});
    });
    it('should update proper data in the database', function(){
      return specialCharacter.get().then((doc)=> {
         doc.data().updated.should.equal(rand);
         return Promise.resolve();
      }).should.be.fulfilled;
    });
    it('should write update to provided batch', function(){
      let b = new batch();
      specialCharacter.update({batchUpdate: new Date()}, {batch: b}).should.be.fulfilled;
      b.writes.should.equal(1);
    });
  });
  describe('#delete()', function(){
    it('should return a promise which resolves once data is deleted', function(){
      return specialCharacter.delete().then(()=> {
        return specialCharacter.get().then((data)=> data.exists ? Promise.reject() : Promise.resolve())
          .catch(()=> Promise.resolve());
      });
    });
    it('should write delete to provided batch', function(){
      let b = new batch();
      specialCharacter.delete({batch: b}).should.be.fulfilled;
      b.writes.should.equal(1);
    });
  });
  describe('#transaction()', function(){
    it('should accept a function which is passed a Transaction, DocumentSnapshot, DocumentReference', function(){
      specialCharacter.transaction((t, doc, ref)=> {
        t.constructor.name.should.equal('Transaction');
        doc.constructor.name.should.equal('DocumentSnapshot');
        ref.constructor.name.should.equal('DocumentReference');
        return Promise.resolve();
      }).should.be.fulfilled;
    });
  });
  describe('#incrementField()', function(){
    it('should intialize the field with the passed value if it does not exist.', function(){
      return specialCharacter.incrementField('score', 2).then(()=> {
        return specialCharacter.get().then((doc)=> {
          chai.expect(doc.data().score == 2).to.be.true;
          return Promise.resolve();
        });
      });
    });
    it('should add to the field with the passed value if it does exist.', function(){
      return specialCharacter.incrementField('score', 2).then(()=> {
        return specialCharacter.get().then((doc)=> {
          chai.expect(doc.data().score == 4).to.be.true;
          return Promise.resolve();
        });
      });
    });
  });
  describe("#reference", function(){
    it('should throw if a parameter is in provided path.', function(){
      chai.expect(()=> characterDoc.reference).to.throw().with.property('message', reference.errors.parameterInPath.message);
    });
    it('should return a standard firestore document reference object', function(){
      specialCharacter.reference.should.respondTo('collection');
      specialCharacter.reference.should.have.property('id', 'zabeebo');
    });
  });
  describe('#id', function(){
    it('should return the document\'s id string', function(){
      specialCharacter.id.should.be.a('string').equal('zabeebo');
    });
  });
  describe('#fromReference', function(){
    it('should return a document matching the passed reference', function(){
      let doc = document.fromReference(specialCharacter.reference);
      doc.should.be.an.instanceOf(document);
      doc._path._string.should.equal(specialCharacter._path._string);
    });
  });
});
