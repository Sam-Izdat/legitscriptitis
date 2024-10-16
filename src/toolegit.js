import {Log} from './util';
new Log(Log.Level.DEBUG);

import Module from "../vendor/LegitScriptWasm.js";
import {Renderer} from './renderer';


// import loader from '@monaco-editor/loader';
import {basicSetup} from "codemirror";
import {EditorView, keymap} from "@codemirror/view";
import {indentWithTab} from "@codemirror/commands";
import {cpp} from "@codemirror/lang-cpp";
import {coolGlow} from 'thememirror';

// const state = EditorState.create({
//   doc: 'my source code',
//   extensions: [dracula],
// });

export * from './transpile';
export var shared = {};

const el_debug_output       = document.querySelector('#compilation-result');
const el_editor_source      = document.querySelector('#editor');
const el_editor_container   = document.querySelector('#editor-container');
const el_button_legitimize  = document.querySelector("#legitimize");
const el_html_canvas        = document.querySelector('#result_canvas');


let editor = new EditorView({
  doc: el_editor_source.value,
  extensions: [
    coolGlow,
    basicSetup,
    keymap.of([indentWithTab]),
    cpp()],
  parent: el_editor_container
});

let ls_compiler = null;
let ls_renderer = null;

let ls_compile = (ls_compiler, content) => {
  try {
    const result = ls_compiler.LegitScriptLoad(content);
    const result_parsed = JSON.parse(result);
    border_green(result);
    return result_parsed;
  } catch (e) {
    border_red(e);
    return false;
  }
};




// loader.init().then(monaco => {
//   monaco.editor.create(el_editor_container, {
//     value: el_editor_source.value,
//     language: 'cpp',
//   });
// });

let rebuild = async (ls_code) => {
  const ls_descs = ls_compile(ls_compiler, ls_code);
  ls_renderer = new Renderer(el_html_canvas, ls_descs);
  await ls_renderer.init();
  if (!!window.lti_stop) { // resume
    window.lti_stop = false;
    let el_html_canvas = document.querySelector('#result_canvas');
    await frame(el_html_canvas.width, el_html_canvas.height)
  }  
}

let init_ls = async () => {
  ls_compiler = await Module();
  const initial_content = editor.state.doc.toString();
  const ls_descs = rebuild(initial_content);
  el_button_legitimize.addEventListener('click', async (e) => {
    let ls_code = editor.state.doc.toString();
    await rebuild(ls_code)
  });

  // Catch unhandled crap so we're not stuck spitting errors in the render loop
  window.addEventListener('unhandledrejection', function(e) {
    Log.error('Unhandled promise rejection:', e.reason);
    window.lti_stop = true;
    e.preventDefault();
    border_red(e);
  });
  window.addEventListener('error', function(e) {
    Log.error('Caught global error:', e.message, e.error);
    window.lti_stop = true;
    e.preventDefault();
    border_red(e);
  });
  Log.info('First frame manifest:', JSON.parse(ls_compiler.LegitScriptFrame(el_html_canvas.width, el_html_canvas.height, performance.now())));
}

let frame = async (width, height) => {
  let ls_frame = JSON.parse(ls_compiler.LegitScriptFrame(width, height, performance.now()));
  await ls_renderer.render(ls_frame);
  await ls_renderer.set_canvas();
  if (!!window.lti_stop) return;
  requestAnimationFrame(() => frame(width, height));
}

export let main = async () => {
  // Set up canvas
  el_html_canvas.width = 768;
  el_html_canvas.height = 560;

  // Init tinyti.js/taichi.js
  await ti.init();

  // Init LegitScript & renderer
  await init_ls();
  requestAnimationFrame(() => frame(el_html_canvas.width, el_html_canvas.height));
}

let border_green = (result) => {  
  el_debug_output.innerText = result;
  el_editor_container.style = 'border:2px solid green';
};

let border_red = (e) => {
  // el_debug_output.innerText = `${e.name} ${e.message}\n ${e.stack}`;
  el_debug_output.innerText = `${e.name} ${e.message}\n ${e.stack}`;
  el_editor_container.style = 'border:2px solid red';
};