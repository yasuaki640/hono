import { handle } from '../../src/adapter/aws-lambda/handler'
import { Hono } from '../../src/hono'
import { basicAuth } from '../../src/middleware/basic-auth'

describe('AWS Lambda Adapter for Hono', () => {
  const app = new Hono()

  app.get('/', (c) => {
    return c.text('Hello Lambda!')
  })

  app.post('/post', async (c) => {
    const body = (await c.req.parseBody()) as { message: string }
    return c.text(body.message)
  })

  const username = 'hono-user-a'
  const password = 'hono-password-a'
  app.use('/auth/*', basicAuth({ username, password }))
  app.get('/auth/abc', (c) => c.text('Good Night Lambda!'))

  const handler = handle(app)

  it('Should handle a GET request and return a 200 response', async () => {
    const event = {
      httpMethod: 'GET',
      headers: { 'content-type': 'text/plain' },
      path: '/',
      body: null,
      isBase64Encoded: false,
      requestContext: {
        domainName: 'example.com',
      },
    }

    const response = await handler(event)
    expect(response.statusCode).toBe(200)
    expect(response.body).toBe('SGVsbG8gTGFtYmRhIQ==')
    expect(response.headers['content-type']).toMatch(/^text\/plain/)
    expect(response.isBase64Encoded).toBe(true)
  })

  it('Should handle a GET request and return a 200 response (LambdaFunctionUrlEvent)', async () => {
    const event = {
      headers: { 'content-type': 'text/plain' },
      rawPath: '/',
      rawQueryString: '',
      body: null,
      isBase64Encoded: false,
      requestContext: {
        domainName: 'example.com',
        http: {
          method: 'GET',
        },
      },
    };
  
    const response = await handler(event);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('SGVsbG8gTGFtYmRhIQ==');
    expect(response.headers['content-type']).toMatch(/^text\/plain/);
    expect(response.isBase64Encoded).toBe(true);
  });

  it('Should handle a GET request and return a 404 response', async () => {
    const event = {
      httpMethod: 'GET',
      headers: { 'content-type': 'text/plain' },
      path: '/nothing',
      body: null,
      isBase64Encoded: false,
      requestContext: {
        domainName: 'example.com',
      },
    }

    const response = await handler(event)
    expect(response.statusCode).toBe(404)
  })

  it('Should handle a POST request and return a 200 response', async () => {
    const searchParam = new URLSearchParams()
    searchParam.append('message', 'Good Morning Lambda!')
    const event = {
      httpMethod: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      path: '/post',
      body: btoa(searchParam.toString()),
      isBase64Encoded: true,
      requestContext: {
        domainName: 'example.com',
      },
    }

    const response = await handler(event)
    expect(response.statusCode).toBe(200)
    expect(response.body).toBe('R29vZCBNb3JuaW5nIExhbWJkYSE=')
  })

  it('Should handle a POST request and return a 200 response (LambdaFunctionUrlEvent)', async () => {
    const searchParam = new URLSearchParams();
    searchParam.append('message', 'Good Morning Lambda!');
    const event = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      rawPath: '/post',
      rawQueryString: '',
      body: btoa(searchParam.toString()),
      isBase64Encoded: true,
      requestContext: {
        domainName: 'example.com',
        http: {
          method: 'POST',
        },
      },
    };
  
    const response = await handler(event);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('R29vZCBNb3JuaW5nIExhbWJkYSE=');
  });
  
  it('Should handle a request and return a 401 response with Basic auth', async () => {
    const event = {
      httpMethod: 'GET',
      headers: {
        'Content-Type': 'plain/text',
      },
      path: '/auth/abc',
      body: null,
      isBase64Encoded: true,
      requestContext: {
        domainName: 'example.com',
      },
    }

    const response = await handler(event)
    expect(response.statusCode).toBe(401)
  })

  it('Should handle a request and return a 200 response with Basic auth', async () => {
    const credential = 'aG9uby11c2VyLWE6aG9uby1wYXNzd29yZC1h'
    const event = {
      httpMethod: 'GET',
      headers: {
        'Content-Type': 'plain/text',
        Authorization: `Basic ${credential}`,
      },
      path: '/auth/abc',
      body: null,
      isBase64Encoded: true,
      requestContext: {
        domainName: 'example.com',
      },
    }

    const response = await handler(event)
    expect(response.statusCode).toBe(200)
    expect(response.body).toBe('R29vZCBOaWdodCBMYW1iZGEh')
  })
})