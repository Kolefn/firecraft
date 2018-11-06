const {collection, document} = require('../lib/firestore');
const reference = require('../lib/firestore/reference');
const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.should();


describe('firestore.collection', function(){

  var characters;

  describe('#constructor()', function(){
    it('should throw bad path error if provided path is invalid', function(){
      chai.expect(()=> new collection('users/{userId}')).to.throw().with.property('message', collection.errors.badPath.message);
      chai.expect(()=> new collection(null)).to.throw().with.property('message', collection.errors.badPath.message);
    });

    it('should create a valid collection object.', function(){
      characters = new collection('users/{userId}/characters');
      characters.should.be.an.instanceOf(collection);
    });
  });

  describe('#parent', function(){
    it('should return the parent document object after first and consequtive uses.', function(){
      let parent = characters.parent;
      parent.should.be.an.instanceOf(document);
      parent._path.should.have.property('_string', 'users/{userId}');
    });
  });

  describe('#document()', function(){

    it('should return a document with a randomly generated id if no path specified.', function(){
      let doc = characters.instance({userId: 'kole'}).document();
      doc.should.be.an.instanceOf(document);
      doc.id.should.be.a('string');
    });

    it('should return a document object', function(){
      characters.document('{traitId}').should.be.an.instanceOf(document);
      characters.document('{traitId}/statistics/{statId}').should.be.an.instanceOf(document);
    });

    it('should throw if relative path does not point to a document', function(){
      chai.expect(()=> characters.document('{traitId}/statistics')).to.throw();
    });
  });

  describe('#add()', function(){
    it('should create a new document with a random id', function(){
      characters.instance({userId: 'kole'}).add({skillPoints: 10, timestamp: new Date()})
        .should.eventually.respondTo('get').have.property('id');
    });
  });

  describe('#instance()', function(){
    it('should return a copy of the collection object when no arguments provided.', function(){
      let instance = characters.instance();
      instance.should.be.an.instanceOf(collection);
      instance._path.should.have.property('_string', characters._path._string);
    });

    it('should return a new collection with provided arguments in place of path parameters', function(){
      let myCharacters = characters.instance({userId: 'kole'});
      myCharacters.should.be.an.instanceOf(collection);
      myCharacters._path.should.have.property("_string", "users/kole/characters");
    });
  });
  let myCharacters;
  describe('#get()', function(){

    it('should fetch all documents when no options provided', function(){
       myCharacters = characters.instance({userId: 'kole'});
        return myCharacters.get().then((snap)=> {
          return typeof snap.size == 'number' ? Promise.resolve() : Promise.reject();
        });
    });

    it('should return QuerySnapshot using orderBy', function(){
      return myCharacters.get({orderBy: 'timestamp'}).then((snap)=> {
        return typeof snap.size == 'number' ? Promise.resolve() : Promise.reject();
      });
    });

    it('should return QuerySnapshot using orderBy w/ direction', function(){
      return myCharacters.get({orderBy: ['timestamp', 'asc']}).then((snap)=> {
        return typeof snap.size == 'number' ? Promise.resolve() : Promise.reject();
      });
    });

    it('should return proper QuerySnapshot using orderBy w/ limit', function(){
      return myCharacters.get({orderBy: ['timestamp', 'asc'], limit: 1}).then((snap)=> {
        return snap.size == 1 ? Promise.resolve() : Promise.reject();
      });
    });

    it('should return QuerySnapshot for where query', function(){
      return myCharacters.get({where: ['public', '==', true]}).then((snap)=> {
        return snap.size == 0 ? Promise.resolve() : Promise.reject();
      });
    });

    it('should return QuerySnapshot for double where query', function(){
      return myCharacters.get({where: ['public', '==', true, 'visible', '==', true]}).then((snap)=> {
        return snap.size == 0 ? Promise.resolve() : Promise.reject();
      });
    });

    it('should return proper QuerySnapshot for startAfter query', function(){
      return myCharacters.get({orderBy: ['timestamp', 'asc']}).then((snap)=> {
        if(snap.size == 0){ return Promise.resolve(false); }
        return myCharacters.get({orderBy: ['timestamp', 'asc'], startAfter: snap.docs[0]}).then((afterSnap)=> {
          return typeof snap.size == 'number' ? Promise.resolve() : Promise.reject();
        });
      });
    });

  });

  describe('#delete()', function(){
    it('should reject when the yes option is not explicitly set', function(){
      myCharacters.delete().should.be.rejected;
    });

    it('should shallow delete all documents in collection when recursive set to false', function(){
      return myCharacters.delete({yes: true, recursive: false}).then(()=> {
        return myCharacters.get().then((snap)=> {
          return snap.size == 0 ? Promise.resolve() : Promise.reject();
        });
      });
    });

    it("should deep delete all documents under collection by default");
  });

  describe('#iterate()', function(){
    it('should fire the provided callback with a document snapshot', function(){
      let fired = 0;
      return myCharacters.iterate((doc)=> { throw "did fire" }).should.be.rejected;
    });

    it('should return a promise that resolves once all batches have been iterated', function(){
      let its = 0;
      myCharacters.iterate((doc)=> its++, {limit: 20}).then(()=> {
        return Promise.resolve(its);
      }).should.eventually.satisfy((num)=> num > 0);
    });

    it('should reject with last document of iteration', function(){
      myCharacters.iterate((doc)=> Promise.reject()).catch((doc)=>{
        return Promise.resolve(doc);
      }).should.eventually.respondTo('data');
    });

    it('should accept all query options like get()', function(){
      return myCharacters.iterate((doc)=> { throw "did fire" }, {orderBy: ['timestamp', 'asc'], where: ['public', '==', true]})
        .should.be.fulfilled;
    });
  });

  describe("#reference", function(){
    it('should throw if a parameter is in provided path.', function(){
      chai.expect(()=> characters.reference).to.throw().with.property('message', reference.errors.parameterInPath.message);
    });

    it('should return a standard firestore document reference object', function(){
      let myCharacters = characters.instance({userId: 'kole'});
      myCharacters.reference.should.respondTo('doc');
      myCharacters.reference.should.have.property('id', 'characters');
    });
  });


});
