# fiatconnect-api-starter

This repository contains a starter API that supports the FiatConnect standard.

## Usage

### Installing

```
yarn install
```

### Building

```
yarn build
```

### Configuring

You can configure the server either with command line arguments, or through a `.env` file in the repository root. See `.env.example` for an example.
Check out `src/config.ts` for an exhaustive list of configuration options.

### Running

Assuming you've filled in a `.env` file in the repository root, run:

```
yarn start
```

### Testing
#### Unit tests
You can run unit tests with jest as follows:
```bash
yarn test
```
#### Integration tests
Integration tests are not included with this starter project. However, an example of how to create a JWT is included 
in `scripts/example-request.ts`.

## Structure & Schema Validation

Handlers for each of the four main groups of endpoints can be found in `/src/routes`. To make implementation easy, *almost* all request schema
validation is taken care of in middleware before the handlers are called. Individual endpoint handlers will have access to type-guarded request
parameters, guaranteed to be syntactically correct. (Checks on request semantics are still up to the implementor themselves.) This means that you
can immediately start implementing business logic within the handlers, without worrying about validation.

The only exception to this is with endpoints whose request bodies are negotiable, i.e., `POST /accounts/:fiatAccountSchema` and `POST /kyc/:kycSchema`.
Since the request body can take many different shapes, schema validation & type guarding must be performed within the route. In both cases, switch
statements are included in the handlers which perform validation and type guarding. Implementors just need to write custom handling logic for each
possible schema.
