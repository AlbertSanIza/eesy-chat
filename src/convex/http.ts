import { httpRouter } from 'convex/server'

import { httpAction } from './_generated/server'
import { stream } from './stream'

const http = httpRouter()

http.route({
    path: '/stream',
    method: 'POST',
    handler: stream
})

http.route({
    path: '/stream',
    method: 'OPTIONS',
    handler: httpAction(async (_, request) => {
        const headers = request.headers
        if (headers.get('Origin') !== null && headers.get('Access-Control-Request-Method') !== null && headers.get('Access-Control-Request-Headers') !== null) {
            return new Response(null, {
                headers: new Headers({
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': 'Content-Type, Digest',
                    'Access-Control-Max-Age': '86400'
                })
            })
        } else {
            return new Response()
        }
    })
})

export default http
