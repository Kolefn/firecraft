const collection = require('../lib/firestore/collection');
const document = require('../lib/firestore/document');
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
      characters.parent.should.be.an.instanceOf(document).with.property('path', 'users/{userId}');
      characters.parent.should.be.an.instanceOf(document);
    });
  });

  describe('#extend()', function(){
    it('should return a document if input path has odd segments', function(){
      characters.extend('{characterId}').should.be.an.instanceOf(document);
    });

    it('should return a collection if input path has even segments', function(){
      characters.extend('{characterId}/traits').should.be.an.instanceOf(collection);
    });

    it('should throw if a path input is not a string', function(){
      chai.expect(characters.extend.bind(characters, null)).to.throw().with.property('message', collection.errors.badPath.message);
    });
  });

  describe('#node()', function(){
    it('should create a new function of the given name.', function(){
      collection.node('test', ()=> 1);
      characters.test.should.be.a('function');
    });

    it('should create a new function that returns properly.', function(){
      characters.test().should.equal(1);
    });

    it('should provide collection instance as first argument.', function(){
      collection.node('test', (col)=> col.should.be.an.instanceOf(collection));
      characters.test(1,2,3);
    });

    it('the defined node should return collection when provided node function does not return a value.', function(){
      collection.node('test', (col)=> { let x = 1 + 2; });
      characters.test().should.be.an.instanceOf(collection);
    })

  });

  var instance;
  describe('#instance()', function(){
    it('should at least return a copy of the collection object', function(){
      characters.instance().should.be.an.instanceOf(collection).with.property('path', characters.path);
    });

    it('should return a new collection with provided arguments in place of path parameters', function(){
      instance = characters.instance({userId: 'kole'}).should.be.an.instanceOf(collection).with.property("path", "users/kole/characters");
    });
  });

  describe("#reference", function(){
    it('should throw if a parameter is in provided path.', function(){
      chai.expect(()=> characters.reference).to.throw().with.property('message', collection.errors.badReferencePath.message);
    });

    it('should return a standard firestore document reference object', function(){
      chai.expect(()=> instance.reference).should.respondTo('doc');
      chai.expect(()=> instance.reference).should.have.property('id', 'characters');
    });
  });

  describe("#isValidPath", function(){
    it('should return false if document path is provided', function(){
      return collection.isValidPath(['users', '{userId}']).should.not.be.ok;
    });

    it('should return true if collection path is provided', function(){
      return collection.isValidPath(['users', '{userId}', 'characters']).should.be.ok;
    });
  });

  describe("#isValidRelativePath", function(){
    it('should return false if document path is provided', function(){
      return collection.isRelativePathValid(['{userId}']).should.not.be.ok;
    });

    it('should return true if collection path is provided', function(){
      return collection.isRelativePathValid(['{userId}', 'characters']).should.be.ok;
    });
  });


})
