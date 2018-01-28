
import * as THREE from 'three';
import { EffectComposer, RenderPass } from "postprocessing";
import * as STATE from './state.js';

import ENTITIES from './entities.js';

import AssignmentPass from './AssignmentPass.js';

// shaders

const VSHADER_GEO = `
varying float ypos;
uniform float time;
void main() {
  float vx = sin(time*4323.43 + position.y) - 0.5;
  float vy = cos(time*2132.53 + position.y) - 0.5;
  float vz = cos(time*1295.27 + position.y) - 0.5;
  vec3 newpos = vec3(position.x + vx*0.5, position.y + vy*0.5, position.z + vz*0.5);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newpos, 1.0);
  ypos = position.z;
}
`;

const FSHADER_GEO = `
varying float ypos;
void main() {
  float col = sin(ypos);
  gl_FragColor = vec4(col, col, col, 1.0);
}
`;

const VSHADER_RAND = `
varying float rand;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  rand = gl_Position.y;
}
`;

const FSHADER_RAND = `
varying float rand;
void main() {
  float r = sin(rand*4323.43);
  float g = cos(rand*2132.53);
  float b = cos(rand*1295.27);
  gl_FragColor = vec4(r, g, b, 1.0);
}
`;

const VSHADER_PHONG = `
`;

const FSHADER_PHONG = `
`;

function init() {

  // Set up scene.

  STATE.scene = new THREE.Scene();
  STATE.scene.background = new THREE.Color( 0x00000 );

  STATE.camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 1, 2000 );
  STATE.camera.position.set( 0, 0, 50 );

  STATE.clock = new THREE.Clock(false);

  // Load resources from file.
  ENTITIES.load(STATE);

}

function postload() {

  // Initialize resources.
  ENTITIES.init(STATE);

  // Set up scene graph.

  // Lights

  STATE.entities.light1 = new THREE.PointLight(0xFF1111, 4, 0, 1);
  STATE.scene.add( STATE.entities.light1 );

  STATE.entities.light2 = new THREE.PointLight(0x11FF11, 4, 0, 1);
  STATE.scene.add( STATE.entities.light2 );

  STATE.entities.light3 = new THREE.PointLight(0x1111FF, 4, 0, 1);
  STATE.scene.add( STATE.entities.light3 );

  // Objects

  STATE.scene.add(STATE.meshes.astronaut);

  let mat2 = new THREE.ShaderMaterial({
    vertexShader: VSHADER_RAND,
    fragmentShader: FSHADER_RAND
  });
  for (let i = 0; i < STATE.meshes.donuts.children[0].children.length; i++) {
    STATE.meshes.donuts.children[0].children[i].material = mat2;
  }
  STATE.scene.add(STATE.meshes.donuts);
  console.log(STATE.meshes.donuts);

  STATE.uniforms.sphere = {
    time: { value: STATE.clock.elapsedTime }
  };

  let geo1 = new THREE.SphereBufferGeometry( 8, 16, 16 );
  let mat1 = new THREE.ShaderMaterial({
    uniforms: STATE.uniforms.sphere,
    vertexShader:   VSHADER_GEO,
    fragmentShader: FSHADER_GEO
  });
  STATE.meshes.planet = new THREE.Mesh(geo1, mat1);
  STATE.scene.add(STATE.meshes.planet);

  // Renderer

  STATE.renderer = new THREE.WebGLRenderer();
  STATE.renderer.setPixelRatio( window.devicePixelRatio );
  STATE.renderer.setSize( window.innerWidth, window.innerHeight );

  STATE.composer = new EffectComposer(STATE.renderer);

  STATE.passes.renderPass = new RenderPass(STATE.scene, STATE.camera);
  STATE.passes.renderPass.renderToScreen = false;
  STATE.passes.assignmentPass = new AssignmentPass();
  STATE.passes.assignmentPass.renderToScreen = true;

  STATE.composer.addPass(STATE.passes.renderPass);
  STATE.composer.addPass(STATE.passes.assignmentPass);

  let container = document.getElementById('app');
  container.appendChild( STATE.renderer.domElement );

  // Controllers

  window.addEventListener( 'resize', onWindowResize, false );
  window.addEventListener( 'keydown', onKeyDown, false );
  window.addEventListener( 'keyup', onKeyUp, false );

  STATE.clock.start();
  loop();

}

function loop() {

	const deltaTime = STATE.clock.getDelta();

	update(deltaTime);
	render(deltaTime);

	requestAnimationFrame( loop );

}

function update(deltaTime) {

  const elapsedTime = STATE.clock.elapsedTime;
  STATE.uniforms.sphere.time.value = elapsedTime;

  STATE.entities.light1.position.set(0, Math.sin(elapsedTime*3)*50-15, 30);
  STATE.entities.light2.position.set(20, Math.sin(elapsedTime*3)*50-15, 10);
  STATE.entities.light3.position.set(-20, Math.sin(elapsedTime*3)*50-15, 10);

  STATE.meshes.astronaut.rotation.set(Math.PI*0.5, 0, elapsedTime);
  STATE.meshes.astronaut.position.set( 0, 0, 10 );
  STATE.meshes.astronaut.scale.set( 4, 4, 4 );

  STATE.meshes.donuts.rotation.set(Math.PI*0.5, 0, -elapsedTime);
  STATE.meshes.donuts.position.set( 0, 0, 40 );
  STATE.meshes.donuts.scale.set( 4, 4, 4 );

  STATE.meshes.planet.position.set(0, Math.sin(elapsedTime*0.5)*5, 0);
  STATE.meshes.donuts.rotation.set(Math.PI*0.5, 0, -elapsedTime);

  ENTITIES.update(deltaTime);
  STATE.keyboard.update( deltaTime );
}

function render(deltaTime) {
  STATE.composer.render(deltaTime);
}

// Events

function onKeyDown(evt) {

    if (evt.keyCode === 37) {
      STATE.passes.renderPass.renderToScreen = true;
      STATE.passes.assignmentPass.renderToScreen = false;
    }

    if (evt.keyCode === 39) {
      STATE.passes.renderPass.renderToScreen = false;
      STATE.passes.assignmentPass.renderToScreen = true;
    }


    if (typeof STATE.keyboard.keys[evt.keyCode] === "undefined" || STATE.keyboard.keys[evt.keyCode] === 0)
        STATE.keyboard.keys[evt.keyCode] = 1;
}

function onKeyUp(evt) {
    STATE.keyboard.keys[evt.keyCode] = 0;
}

function onWindowResize() {

	STATE.camera.aspect = window.innerWidth / window.innerHeight;
	STATE.camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

STATE.loader.finishedLoading = postload;
init();
