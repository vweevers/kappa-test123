const kappa = require('kappa-core')
const View = require('./kappa-view-level') // require('kappa-view-level')
const level = require('level')

const location = './data/db/' + Date.now()
const raf = './data/raf/' + Date.now()

function factory () {
  const core = kappa(raf, { valueEncoding: 'json' })
  const ldb = level(location, { valueEncoding: 'json' })

  const view = View(ldb, {
    map: function (msg) {
      return [
        [ msg.value.key.toUpperCase(), msg.value.value ]
      ]
    },
    api: {
      get: function (core, key, cb) {
        ldb.get(key, cb)
      }
    }
  })

  core.use('mapper', view)

  return { core, ldb }
}

const { core, ldb } = factory()

core.writer(function (err, feed) {
  feed.append({ key: 'foo', value: 123 })

  core.ready('mapper', function () {
    core.api.mapper.get('FOO', console.log)

    ldb.close(function (err) {
      if (err) throw err

      const { core } = factory()

      core.ready('mapper', function () {
        core.api.mapper.get('FOO', console.log)
      })
    })
  })
})
