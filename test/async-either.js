import Async from '..'
import { should } from 'chai'
should()

function assertRightVal (expected, a) {
  a.run(function (e) {
    e.isRight.should.equal(true, 'Expected right but received left')
    e.value.should.equal(expected)
  })
}

function assertLeftVal (expected, a) {
  a.run(function (e) {
    e.isLeft.should.equal(true, 'Expected left but received right')
    e.value.should.equal(expected)
  })
}

describe('AsyncEither', function () {
  const inc = (x) => x + 1

  it('should run the resolve function', function () {
    let executed = false
    function markExecuted () {
      executed = true
    }
    new Async(function (resolve) {
      resolve()
    }).run(markExecuted)
    executed.should.equal(true)
  })

  describe('#Left', function () {
    it('should ', function () {
      assertLeftVal('someValue', Async.Left('someValue'))
    })
  })

  describe('#of', function () {
    it('should resolve an Either of the provided value', function () {
      assertRightVal(1, Async.of(1))
    })
  })

  describe('#map', function () {
    it('should apply the provided function to the contained value', function () {
      const a = Async.of(1).map(inc)
      assertRightVal(2, a)
    })

    it('should not apply the provided function to a left value', function () {
      assertLeftVal('someValue', Async.Left('someValue').map(inc))
    })
  })

  describe('#ap', function () {
    it('should apply its function to the value contained in the input', function () {
      assertRightVal(20, Async.of(inc).ap(Async.of(19)))
    })

    it('shold not apply its function to a left input', function () {
      assertLeftVal('someValue', Async.of(inc).ap(Async.Left('someValue')))
    })

    it('should not apply its value to the input if it is a left', function () {
      assertLeftVal('someValue', Async.Left('someValue').ap(Async.of(1)))
    })
  })

  describe('#chain', function () {
    const incToAsync = (x) => Async.of(x + 1)
    it('should apply the function to its value and return the resulting async', function () {
      assertRightVal(42, Async.of(41).chain(incToAsync))
    })

    it('should not apply the function to a left value', function () {
      assertLeftVal('someValue', Async.Left('someValue').chain(inc))
    })
  })
})
