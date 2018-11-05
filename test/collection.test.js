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
      characters.instance({userId: 'kole'}).add({skillPoints: 10}).then((ref)=> {
        ref.should.respondTo('get');
        ref.should.have.property('id');
        return Promise.resolve();
      }).should.be.fulfilled;
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
      return myCharacters.get().then((snap)=> {
        snap.should.have.property('size');
        return Promise.resolve();
      }).should.be.fulfilled;
    });

    it('should return QuerySnapshot using orderBy', function(){
      return myCharacters.get({orderBy: 'timestamp'}).then((snap)=> {
        snap.should.have.property('size');
        return Promise.resolve();
      }).should.be.fulfilled;
    });

    it('should return QuerySnapshot using orderBy w/ direction', function(){
      return myCharacters.get({orderBy: ['timestamp', 'asc']}).then((snap)=> {
        snap.should.have.property('size');
        return Promise.resolve();
      }).should.be.fulfilled;
    });

    it('should return proper QuerySnapshot using orderBy w/ limit', function(){
      return myCharacters.get({orderBy: ['timestamp', 'asc'], limit: 1}).then((snap)=> {
        snap.should.have.property('size', 1);
        return Promise.resolve();
      }).should.be.fulfilled;
    });

    it('should return QuerySnapshot for where query', function(){
      return myCharacters.get({where: ['public', '==', true]}).then((snap)=> {
        snap.should.have.property('size', 0);
        return Promise.resolve();
      }).should.be.fulfilled;
    });

    it('should return QuerySnapshot for double where query', function(){
      return myCharacters.get({where: ['public', '==', true, 'visible', '==', true]}).then((snap)=> {
        snap.should.have.property('size', 0);
        return Promise.resolve();
      }).should.be.fulfilled;
    });

    it('should return proper QuerySnapshot for startAfter query', function(){
      return myCharacters.get({orderBy: ['timestamp', 'asc']}).then((snap)=> {
        let data = []
        snap.forEach((doc)=> data.push(doc.data().timestamp));
        return myCharacters.get({orderBy: ['timestamp', 'asc'], startAfter: data[0]}).then((afterSnap)=> {
          afterSnap.should.have.property('size', 1);
          return Promise.resolve();
        })
      }).should.be.fulfilled;
    });

  });

  describe('#iterate()', function(){
    var myCharacters;
    before(function(){
      myCharacters = characters.instance({userId: 'kole'});
    })
    it('should fire the provided callback with a document snapshot', function(){
      myCharacters.iterate((doc)=> doc.should.respondTo('data'));
    });

    it('should return a promise that resolves once all batches have been iterated', function(){
      let its = 0;
      myCharacters.iterate((doc)=> its++, {limit: 1}).then(()=> {
        its.should.equal(2);
        return Promise.resolve();
      }).should.be.fulfilled;
    });

    it('should reject with last document of iteration', function(){
      myCharacters.iterate((doc)=> Promise.reject()).catch((doc)=>{
        doc.should.respondTo('data');
      });
    });

    it('should accept all query options like get()', function(){
      myCharacters.iterate((doc)=> doc.should.respondTo('data'), {orderBy: ['timestamp', 'asc'], where: ['public', '==', true]})
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
