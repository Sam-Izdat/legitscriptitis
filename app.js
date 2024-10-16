import GLSL from 'glsl-transpiler';

let compile = GLSL({
	// Enable expressions optimizations.
	optimize: false,

	// Apply preprocessing. Pass custom preprocessor function `(srcString) => resultString;` to set own preprocessing.
	preprocess: true,

	uniform: function (name) {
		return `uniforms.${name}`
	},
	attribute: function (name) {
		return `attributes.${name}`
	},

	// Same as `uniform`, but for varying declarations.
	varying: false,

	// GLSL shader version, one of `'300 es'` or `'100 es'`.
	version: '100 es',

	// Append stdlib includes for the result. Can be bool or an object with defined stdlib functions to include, eg. `{normalize: false, min: false}`.
	includes: true,

	// Enable debugging facilities: `print(anything)` will log to console a string of transpiled code with it’s type separated by colon, `show(anything)` will print the rendered descriptor of passed fragment of code. Note also that you can safely use `console.log(value)` to debug shader runtime.
	debug: false
});

//compile source code
let result = compile(`
	precision mediump float;
	attribute vec2 uv;
	attribute vec4 color;
	varying vec4 fColor;
	uniform vec2 uScreenSize;

	void main (void) {
		fColor = color;
		vec2 position = vec2(uv.x, -uv.y) * 1.0;
		position.x *= uScreenSize.y / uScreenSize.x;
		gl_Position = vec4(position, 0, 1);
	}
`)
// let result = compile(`
// 	void main (void) {
// 		vec2 position = vec2(0.1, 0.2) * 1.0
// 		position.x *= uScreenSize.y / uScreenSize.x
// 		gl_Position = vec4(position, 0, 1)
// 	}

// `)


//get collected info
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
console.log(result);