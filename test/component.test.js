const component = require('../lib/firestore/component');
const chai = require('chai');
chai.should();

describe('component', function(){
  var comp;
  before(function(){
    comp = new component();
  });
  
  describe('#node()', function(){
    it('should create a new function of the given name.', function(){
      component.node('test', ()=> 1);
      comp.test.should.be.a('function');
    });

    it('should create a new function that returns properly.', function(){
      comp.test().should.equal(1);
    });

    it('should provide component instance as first argument.', function(){
      component.node('test', (col)=> col.should.be.an.instanceOf(component));
      comp.test(1,2,3);
    });

    it('the defined node should return component when provided node function does not return a value.', function(){
      component.node('test', (col)=> { let x = 1 + 2; });
      comp.test().should.be.an.instanceOf(component);
    })
  });
});
