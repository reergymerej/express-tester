const routes = require('./')

const getRouteTester = routes => (req) => {
  return new Promise((resolve, reject) => {
    // TODO: Handle multiple send
    // These will finish immediately, but things like `send` can be done
    // multiple times.
    const res = {
      _done: false,
      json: jest.fn(() => {
        res._done = true
      }),
      end: jest.fn(() => {
        res._done = true
      }),
      render: jest.fn(() => {
        res._done = true
      }),
    }

    const next = () => {
      // Maybe this shouldn't be a failure.
      reject('called next')
    }
    // TODO: Pull this in during init.
    routes.handle(req, res, next)

    // poll until done, then assert
    let n = 0
    const max = 1000
    while (n++ < max) {
      if (res._done) {
        console.log(`done after ${n} loops`)
        break
      }
    }

    if (n > max) {
      return reject(new Error('response time out'))
    }

    resolve(res)
  })
}

const testRoute = getRouteTester(routes)

it('should handle get', () => {
  const req = {
    url: '/',
    method: 'get',
  }
  return testRoute(req).then(res => {
    expect(res.render).toHaveBeenCalled()
  })
})

it('should handle post', () => {
  const req = {
    url: '/bork',
    method: 'post',
    body: {
      hello: 1,
    },
  }
  return testRoute(req).then(res => {
    expect(res.json).toHaveBeenCalled()
  })
})
