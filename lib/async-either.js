import Either from 'data.either'

export default AsyncEither

function AsyncEither (r) {
  this.run = r
}

AsyncEither.prototype.map = function (f) {
  return AsyncEither.of(f).ap(this)
}

AsyncEither.prototype.ap = function (a) {
  const outer = this
  return new AsyncEither(function (resolve) {
    let first, second

    function resolveIfDone () {
      if (first != null && second != null) {
        resolve(first.ap(second))
      }
    }

    outer.run(function (e) {
      first = e
      resolveIfDone()
    })

    a.run(function (e) {
      second = e
      resolveIfDone()
    })
  })
}

AsyncEither.prototype.chain = function (f) {
  const outer = this
  return new AsyncEither(function (resolve) {
    outer.run(function (e) {
      if (e.isLeft) {
        resolve(e)
      } else {
        f(e.value).run(resolve)
      }
    })
  })
}

AsyncEither.of = function (v) {
  return new AsyncEither(function (resolve) {
    resolve(Either.of(v))
  })
}

AsyncEither.Left = function (v) {
  return new AsyncEither(function (resolve) {
    resolve(Either.Left(v))
  })
}

function _once (fn) {
  let shouldRun = true
  return function (x) {
    if (shouldRun) {
      shouldRun = false
      fn(x)
    }
  }
}
