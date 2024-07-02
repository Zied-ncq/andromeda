
export class GalaxyService {

    buildOpenApiSpecification(){
        return`openapi: 3.0.0
info:
  description: "Test swagger specification"
  version: "1.0.0"
  title: "Test swagger specification"
  contact:
    email: "super.developer@gmail.com"
servers:
  - url: http://127.0.0.1:5000/
    description: Localhost
paths:
  /live:
    get:
      description: Liveliness probe (health check)
      tags:
        - Startup probe
      responses:
        200:
          description: 'Server is alive'
          content:
            application/json:
              schema:
                type: object
                example:
                  status: "..."
  /ready:
    get:
      description: Readiness probe, app is ready to accept requests, initialization phase is completed...
      tags:
        - Startup probe
      responses:
        200:
          description: 'Server is ready'
          content:
            application/json:
              schema:
                type: object
                example:
                  uptime: number
  /api/compile:
    post:
      tags:
        - engine
      description: Uploads and compile bpmn files
      responses:
        200:
          description: 'Compile file'

      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                bpmnFile:
                  type: array
                  items:
                    type: string
                    format: binary
                wpid:
                  type: string
  /api/run-embedded:
    post:
      tags:
        - engine
      description: run embedded container (suitable for sandbox mode)
      responses:
        200:
          description: 'Process instance id'
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                wpid:
                  type: string`
    }
}