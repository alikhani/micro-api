const createRouter = require('uniloc')
const uuid = require('uuid')
const { json, send } = require('micro')

const microApi = (routeConfigs) => {
  let routes = {}
  let handlers = {}

  routeConfigs.forEach(routeConfig => {
    const id = uuid()
    const method = routeConfig.method.toUpperCase()
    routes = Object.assign(
      routes,
      { [id]: `${method} ${routeConfig.path}` }
    )

    handlers = Object.assign(
      handlers,
      { [id]: routeConfig.handler }
    )
  })

  const router = createRouter(routes)

  return async (req, res) => {
    const route = router.lookup(req.url, req.method)
    const handler = handlers[route.name]

    if (!handler) {
      const message = `Page not found (${req.method}): ${req.url}`
      return send(res, 404, { message })
    }

    try {
      let reqBody

      try {
        reqBody = await json(req)
      } catch(error) {
        reqBody = {}
      }

      const resBody = await handler(reqBody, route.options)
      send(res, 200, resBody)
    } catch(error) {
      return send(res, 500, { message: error.message })
    }
  }
}

module.exports = microApi
