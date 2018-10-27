const {collection, document} = require('../lib/firestore');
const reference = require('../lib/firestore/reference');
const chai = require('chai');
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
    it('should return a document object', function(){
      characters.document('{traitId}').should.be.an.instanceOf(document);
      characters.document('{traitId}/statistics/{statId}').should.be.an.instanceOf(document);
    });
    it('should throw if relative path does not point to a document', function(){
      chai.expect(()=> characters.document('{traitId}/statistics')).to.throw();
    });
  });

  describe('#instance()', function(){
    it('should at least return a copy of the collection object', function(){
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
