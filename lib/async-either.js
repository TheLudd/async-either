import Either from 'data.either'

export default AsyncEither

function AsyncEither (r) {
  this.run = r
}

AsyncEither.prototype.map = function (f) {
  const outer = this
  return new AsyncEither(function (resolve) {
    outer.run(function (e) {
      resolve(e.map(f))
    })
  })
}

AsyncEither.prototype.ap = function (a) {
  const outer = this
  return new AsyncEither(function (resolve) {
    outer.run(function (e) {
      a.run(function (e2) {
        resolve(e.ap(e2))
      })
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
