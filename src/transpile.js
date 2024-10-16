import {Log} from './util';
import GLSL from 'glsl-transpiler'

export let transpile_glsl = (glsl) => {
	let compile = GLSL({
		// Enable expressions optimizations.
		optimize: false,

		// Apply preprocessing. Pass custom preprocessor function `(srcString) => resultString;` to set own preprocessing.
		preprocess: false,

		uniform: (name) => `uniforms.${name}`,

		attribute: (name) => `attributes.${name}`,

		// Same as `uniform`, but for varying declarations.
		varying: false,

		// GLSL shader version, one of `'300 es'` or `'100 es'`.
		version: '100 es',

		// Append stdlib includes for the result. Can be bool or an object with defined stdlib functions to include, eg. `{normalize: false, min: false}`.
		includes: true,

		// Enable debugging facilities: `print(anything)` will log to console a string of transpiled code with it’s type separated by colon, `show(anything)` will print the rendered descriptor of passed fragment of code. Note also that you can safely use `console.log(value)` to debug shader runtime.
		debug: true
	});

	let result = compile(glsl);

	let {
		attributes,
		uniforms,
		varyings,
		structs,
		functions,
		scopes
	} = compile.compiler;


	//clean collected info
	compile.compiler.reset();
	return result;
};