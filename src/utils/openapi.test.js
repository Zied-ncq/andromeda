import { OpenApiGenerator } from './open-api.generator.js';
import YAML from "yaml"; // Adjust the path as needed

describe('OpenApiGenerator', () => {
    let apiGenerator;

    beforeEach(() => {
        apiGenerator = new OpenApiGenerator();
    });

    test('should set server correctly', () => {
        apiGenerator.setServer('http://localhost:3000', 'Local Server');
        expect(apiGenerator.servers).toEqual([{ url: 'http://localhost:3000', description: 'Local Server' }]);
        apiGenerator.render()
    });

    test('should set info correctly', () => {
        const info = {
            description: 'New Description',
            version: '2.0.0',
            title: 'New Title',
            contact: { email: 'new.email@gmail.com' }
        };
        apiGenerator.setInfo(info);
        expect(apiGenerator.info).toEqual(info);
    });

    test('should set info title correctly', () => {
        apiGenerator.setInfoTitle('New Title');
        expect(apiGenerator.info.title).toBe('New Title');
    });

    test('should set info description correctly', () => {
        apiGenerator.setInfoDescription('New Description');
        expect(apiGenerator.info.description).toBe('New Description');
    });

    test('should set info version correctly', () => {
        apiGenerator.setInfoVersion('2.0.0');
        expect(apiGenerator.info.version).toBe('2.0.0');
    });

    test('should set info contact email correctly', () => {
        apiGenerator.setInfoContactEmail('new.email@gmail.com');
        expect(apiGenerator.info.contact.email).toBe('new.email@gmail.com');
    });

    test('should add path correctly', () => {
        apiGenerator.addPath('/new-path', 'get');
        expect(apiGenerator.paths['/new-path']).toBeDefined();
        expect(apiGenerator.paths['/new-path'].get).toBeDefined();
    });

    test('should add path description correctly', () => {
        apiGenerator.addPath('/new-path', 'get');
        apiGenerator.addPathDescription('/new-path', 'get', 'This is a description');
        expect(apiGenerator.paths['/new-path'].get.description).toBe('This is a description');
    });

    test('should add path variable parameter correctly', () => {
        apiGenerator.addPath('/new-path', 'get');
        apiGenerator.addPathVariableParameter('/new-path', 'get', 'id', 'string');
        expect(apiGenerator.paths['/new-path'].get.parameters).toEqual([{
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
        }]);
    });

    test('should add path tags correctly', () => {
        apiGenerator.addPath('/new-path', 'get');
        apiGenerator.addPathTags('/new-path', 'get', ['tag1', 'tag2']);
        expect(apiGenerator.paths['/new-path'].get.tags).toEqual(['tag1', 'tag2']);
    });

    test('should add response correctly', () => {
        const response = {
            "200": {
                description: 'Success'
            }
        };
        apiGenerator.addPath('/new-path', 'get');
        apiGenerator.addResponse('/new-path', 'get', response);
        expect(apiGenerator.paths['/new-path'].get.responses['200']).toEqual({ description: 'Success' });
    });

    test('should set path response schema correctly', () => {
        const schema = { type: 'object', properties: { name: { type: 'string' } } };
        apiGenerator.addPath('/new-path', 'get');
        apiGenerator.addResponse('/new-path', 'get', { "200": {} });
        apiGenerator.setPathResponseSchema('/new-path', 'get', '200', 'application/json', schema);
        expect(apiGenerator.paths['/new-path'].get.responses['200'].content['application/json'].schema).toEqual(schema);
    });

    test('should set request body content correctly', () => {
        const content = { 'application/json': { schema: { type: 'object' } } };
        apiGenerator.addPath('/new-path', 'post');
        apiGenerator.setRequestBody('/new-path', 'post', { content: {} });
        apiGenerator.setRequestBodyContent('/new-path', 'post', content);
        expect(apiGenerator.paths['/new-path'].post.requestBody.content['application/json'].schema).toEqual({ type: 'object' });
    });

    test('should render YAML correctly', () => {
        apiGenerator.setServer('http://localhost:3000', 'Local Server')
            .setInfo({
                description: 'Test API',
                version: '1.0.0',
                title: 'Test API',
                contact: { email: 'test@example.com' }
            })
            .addPath('/test', 'get')
            .addResponse('/test', 'get', {
                '200': {
                    description: 'Successful response',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    message: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            });

        const yaml = apiGenerator.render();
        const parsedYaml = YAML.parse(yaml);

        expect(parsedYaml.openapi).toBe('3.0.0');
        expect(parsedYaml.info).toEqual({
            description: 'Test API',
            version: '1.0.0',
            title: 'Test API',
            contact: { email: 'test@example.com' }
        });
        expect(parsedYaml.servers).toEqual([{ url: 'http://localhost:3000', description: 'Local Server' }]);
        expect(parsedYaml.paths['/test'].get.responses['200'].description).toBe('Successful response');
        expect(parsedYaml.paths['/test'].get.responses['200'].content['application/json'].schema).toEqual({
            type: 'object',
            properties: { message: { type: 'string' } }
        });
    });
});
