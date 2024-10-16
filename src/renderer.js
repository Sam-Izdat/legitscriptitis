import {Log} from './util';
import {transpile_glsl} from './transpile';

export class Shader {
  constructor(body, name, outs, samplers, uniforms) { 
    this.body = body;
    this.name = name;
    this.outs = outs;
    this.samplers = samplers;
    this.uniforms = uniforms;
    this.shader_code_glsl = '';
    for (let i in this.uniforms)  { this.shader_code_glsl += `uniform ${this.uniforms[i].type} ${this.uniforms[i].name};\n`; }
    for (let i in this.outs)      { this.shader_code_glsl += `${this.outs[i].type} ${this.outs[i].name} = vec4(0.0);\n`; }
    this.shader_code_glsl += 'vec4 gl_FragCoord = vec4(_lti_frag_coord.x + 0.5, _lti_frag_coord.y + 0.5, 0., 0.);\n'
    this.shader_code_glsl += this.body;
    this.shader_code_ti = transpile_glsl(this.shader_code_glsl);;
    this.shader_code_ti += '\nmain();\n'
    for (let i in this.outs) { this.shader_code_ti += `ti.textureStoreLod(attachments[${i}], _lti_frag_coord, ${this.outs[i].name}, 0);`; }
    this.prog = ti.func(`(attachments, samplers, uniforms, _lti_frag_coord, _lti_resolution, _lti_time, _lti_delta_time) => {\n${this.shader_code_ti}\n}`);
  Log.warning(this);
  }
}

export class Renderer {
  textures = [];
  constructor(html_canvas, ls_descs) { 
    this.html_canvas = html_canvas;
    this.resolution = [this.html_canvas.width, this.html_canvas.height]

    this.last_time = performance.now()
    this.delta_time = this.last_time;
    this.frame_ct = 0;

    this.shaders = {};
    for (let desc of ls_descs.shader_descs) {
      this.shaders[desc.name] = new Shader(desc.body, desc.name, desc.outs, desc.samplers, desc.uniforms);
    }

    this.render_kernel = ti.classKernel(
      this,
      {shader:ti.template(), attachments:ti.template(), samplers:ti.template(), uniforms:ti.template(), time:ti.f32, delta_time:ti.f32},
      (shader, attachments, samplers, uniforms, time, delta_time) => {
        let tex = attachments[0];
        for (let I of ti.ndrange(tex.dimensions[0], tex.dimensions[1])) {
          shader.prog(attachments, samplers, uniforms, I, this.resolution, time, delta_time);
        }
      });
  }

  init = async () => {
    await this.init_textures();
  };

  init_textures = async () => {
    this.canvas = new ti.Canvas(this.html_canvas);
    this.textures = [];
    this.textures.push(ti.texture(4, this.resolution));
  };

  set_canvas = async () => this.canvas.setImage(this.textures[0]);

  render = async (ls_frame) => {
    this.frame_ct = (this.frame_ct + 1) % 1000000;
    let now = performance.now();
    let delta_time = this.last_time - now;
    this.last_time = now;
    for (let inv of ls_frame.shader_invocations) {
      let [attachments, uniforms] = [[], {}];
      for (let att of inv.color_attachments) { attachments.push(this.textures[att.id]); }
      for (let i in inv.uniforms) { uniforms[this.shaders[inv.shader_name].uniforms[i].name] = inv.uniforms[i].val; }
      try {
        this.render_kernel(this.shaders[inv.shader_name], attachments, [], uniforms, now, delta_time);
      } catch (e) {
        window.legitscriptitis_stop = true;
        break;
      }
    }
  };
}