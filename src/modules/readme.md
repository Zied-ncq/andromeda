### Modules are loaded dynamically 
1. The container module is located under engine module because it has customization (/engine/builder/templates/src/modules)
2. web module is used for both engine and container
3. persistence should always be linked to galaxy module


Workflow -> process instances

process instance = generated service class

service class has a **context**
the context contains all shared objects, like variables

snjk = static nunjucks file 
--

## Code generation
- using static files (snjk extension, static nunjucks files)
  - the folder of the templates is parsed recursively, if a snjk file is found it will be copied as it is.
- using templates combined with [nunjucks](https://mozilla.github.io/nunjucks/) 
- The last method and for the dynamic content we use the excellent tool [ts-morph](https://ts-morph.com/)
  - The service class is generated with a template, then we inject methods into the class
  - We inject also code inside existing methods.

Concept of code generation
--
Each node will be translated into a method or more,
for example a script task will be translated in to a single method  containing the script to execute.
a signal catch event will be translated into two methods, the first method will initialize the behaviour and stops at that point
the second method will be linked to a rest route, once the rest controller hit this method it will resume the execution.

- Each method will typically call the next methods (or the next nodes) since each node is translated to a method.
- Each method will call the next method(s) using a flow, the flow has attributes.




## variables 
variables are persisted in the database as string values to ease the debug and for better ops experience.
the type is persisted along with the variable name and value.



#