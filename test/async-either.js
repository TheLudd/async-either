import Async from '..'
import Either from 'data.either'
import { should } from 'chai'
should()

function runAsserter (correctType, incorrectType, typeProp, expected, a) {
  let didRun = false
  a.run(function (e) {
    didRun.should.equal(false, 'run was called more than once')
    didRun = true
    e[typeProp].should.equal(true, 'Expected ' + correctType + ' but received ' + incorrectType)
    e.value.should.equal(expected)
  })
  didRun.should.equal(true)
}

function assertRightVal (expected, a) {
  runAsserter('right', 'left', 'isRight', expected, a)
}

function assertLeftVal (expected, a) {
  runAsserter('left', 'right', 'isLeft', expected, a)
}

describe('AsyncEither', function () {
  const inc = (x) => x + 1

  it('should run the resolve function', function () {
    let executed = false
    function markExecuted () {
      executed = true
    }
    Async(function (resolve) {
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
    const delayAsync = (time, val) => Async(function (resolve) {
      setTimeout(function () {
        resolve(Either.of(val))
      }, time)
    })

    it('should apply its function to the value contained in the input', function () {
      assertRightVal(20, Async.of(inc).ap(Async.of(19)))
    })

    it('shold not apply its function to a left input', function () {
      assertLeftVal('someValue', Async.of(inc).ap(Async.Left('someValue')))
    })

    it('should not apply its value to the input if it is a left', function () {
      assertLeftVal('someValue', Async.Left('someValue').ap(Async.of(1)))
    })

    it('should run the two asyncs in parallel', function (done) {
      this.timeout(60)
      const incBy = (x) => (y) => x + y
      const a = delayAsync(40, 5).map(incBy)
      const b = delayAsync(40, 10)
      a.ap(b).run(function (e) {
        e.value.should.equal(15)
        done()
      })
    })

    it('should finish early if the first async is left', function () {
      const a = Async.Left('someValue')
      const b = delayAsync(2000, 'someOtherValue')
      assertLeftVal('someValue', a.ap(b))
    })

    it('should finish early if the seconf async is left', function () {
      const a = delayAsync(2000, 'someOtherValue')
      const b = Async.Left('someValue')
      assertLeftVal('someValue', a.ap(b))
    })

    it('should only resolve the first left if both are left', function () {
      assertLeftVal('someValue', Async.Left('someValue').ap(Async.Left('someOtherValue')))
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
