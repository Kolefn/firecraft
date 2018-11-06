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
      characters.instance({userId: 'kole'}).add({skillPoints: 10})
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

  describe('#get()', function(){
    let myCharacters;
    it('should fetch all documents when no options provided', function(){
       myCharacters = characters.instance({userId: 'kole'});
        myCharacters.get().then((snap)=> {
          return Promise.resolve(typeof snap.size == 'number');
        }).should.eventually.be.ok;
    });

    it('should return QuerySnapshot using orderBy', function(){
      myCharacters.get({orderBy: 'timestamp'}).then((snap)=> {
        return Promise.resolve(typeof snap.size == 'number');
      }).should.eventually.be.ok;
    });

    it('should return QuerySnapshot using orderBy w/ direction', function(){
      myCharacters.get({orderBy: ['timestamp', 'asc']}).then((snap)=> {
        return Promise.resolve(typeof snap.size == 'number');
      }).should.eventually.be.ok;
    });

    it('should return proper QuerySnapshot using orderBy w/ limit', function(){
      myCharacters.get({orderBy: ['timestamp', 'asc'], limit: 1}).then((snap)=> {
        return Promise.resolve(snap.size == 1);
      }).should.eventually.be.ok;
    });

    it('should return QuerySnapshot for where query', function(){
      myCharacters.get({where: ['public', '==', true]}).then((snap)=> {
        return Promise.resolve(snap.size == 0);
      }).should.eventually.be.ok;
    });

    it('should return QuerySnapshot for double where query', function(){
      myCharacters.get({where: ['public', '==', true, 'visible', '==', true]}).then((snap)=> {
        return Promise.resolve(snap.size == 0);
      }).should.eventually.be.ok;
    });

    it('should return proper QuerySnapshot for startAfter query', function(){
      myCharacters.get({orderBy: ['timestamp', 'asc']}).then((snap)=> {
        return myCharacters.get({orderBy: ['timestamp', 'asc'], startAfter: snap.docs[0]}).then((afterSnap)=> {
          return Promise.resolve(typeof snap.size == 'number');
        });
      }).should.eventually.be.ok;
    });

  });

  describe('#iterate()', function(){
    var myCharacters;
    before(function(){
      myCharacters = characters.instance({userId: 'kole'});
    })
    it('should fire the provided callback with a document snapshot', function(){
      let fired = 0;
      return myCharacters.iterate((doc)=> { throw "did fire" }).should.be.rejected;
    });

    it('should return a promise that resolves once all batches have been iterated', function(){
      let its = 0;
      myCharacters.iterate((doc)=> its++, {limit: 20}).then(()=> {
        return Promise.resolve(its);
      }).should.eventually.satisfy((num)=> num > 50);
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
