import Either from 'data.either'

export default AsyncEither

function AsyncEither (r) {
  if (!(this instanceof AsyncEither)) {
    return new AsyncEither(r)
  }
  this.run = r
}

AsyncEither.prototype.map = function (f) {
  return AsyncEither.of(f).ap(this)
}

AsyncEither.prototype.ap = function (a) {
  return AsyncEither((resolve) => {
    let first, second
    const resolveOnce = once(resolve)

    this.run(function (e) {
      first = e
      resolveIfDone()
    })

    a.run(function (e) {
      second = e
      resolveIfDone()
    })

    function resolveIfDone () {
      if (second == null) resolveIfLeft(first)
      else if (first == null) resolveIfLeft(second)
      else resolveOnce(first.ap(second))
    }

    function resolveIfLeft (e) {
      if (e.isLeft) resolveOnce(e)
    }
  })
}

AsyncEither.prototype.chain = function (f) {
  return AsyncEither((resolve) => {
    this.run(function (e) {
      if (e.isLeft) {
        resolve(e)
      } else {
        f(e.value).run(resolve)
      }
    })
  })
}

AsyncEither.of = function (v) {
  return AsyncEither(function (resolve) {
    resolve(Either.of(v))
  })
}

AsyncEither.Left = function (v) {
  return AsyncEither(function (resolve) {
    resolve(Either.Left(v))
  })
}

function once (fn) {
  let shouldRun = true
  return function (x) {
    if (shouldRun) {
      shouldRun = false
      fn(x)
    }
  }
}
