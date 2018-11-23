const document = require('../lib/firestore/document');
const batch = require('../lib/firestore/batch');
const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.should();
describe('batch', function(){
  var b;
  describe('#constructor()', function(){
    it('should create an internal firestore batch and init a write count', function(){
      b = new batch();
      b.should.be.an.instanceOf(batch);
      b._batch.constructor.name.should.equal('WriteBatch');
      b._writes.should.equal(0);
      b._options.commitWhenFull.should.be.ok;
    });
  });
  describe('#writes', function(){
    it('should return a number', function(){
      return b.writes.should.be.a('number').equal(0);
    })
  });
  describe('#full', function(){
    it('should return false', function(){
      return b.full.should.not.be.ok;
    });
  });
  describe('#empty', function(){
    it('should return true', function(){
      return b.empty.should.be.ok;
    })
  });
  var ref;
  describe('#set()', function(){
    it('should cause write count to increment', function(){
      ref = new document('users/kole').reference;
      b.set(ref, {writes: b.writes}).should.be.an.instanceOf(Promise);
      b.writes.should.equal(1);
    });
  });
  describe('#update()', function(){
    it('should cause write count to increment', function(){
      b.update(ref, {writes: b.writes}).should.be.an.instanceOf(Promise);
      b.writes.should.equal(2);
    });
  });
  var _batch;
  describe('#commit()', function(){
    this.timeout(10000);
    before(function(done){
      _batch = b._batch;
      b.commit().then(done);
    });
    it('should perform writes on database', function(){
      return ref.get().then((doc)=> {
        doc.data().writes.should.equal(1);
        return Promise.resolve();
      }).should.be.fulfilled;
    });
    it('should reset the interal batch state', function(){
      _batch.should.not.equal(b._batch);
      b.writes.should.equal(0);
    });
  });
  describe('#_onWriteAdded', function(){
    it('should automatically commit after max writes & reject when full', function(){
      this.timeout(5000);
      let someBatch = new batch();
      let ref = new document('maps/dust2').reference;
      for(let i = 1; i <= 499; i++){
        someBatch.set(ref, {writes: i}, {merge: true});
      }
      someBatch.set(ref, {writes: 500}, {merge: true}).then(()=> {
        return ref.get().then((doc)=> {
          doc.data().writes.should.equal(500);
          return Promise.resolve();
        });
      }).should.be.fulfilled;
      chai.expect(()=> someBatch.set(ref, {writes: 500}, {merge: true})).to.throw();
    });
  });

});
