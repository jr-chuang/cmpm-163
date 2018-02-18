
import * as THREE from 'three';
import { EffectComposer, RenderPass } from "postprocessing";
import * as STATE from './state.js';

import dat from 'dat.gui';

let OrbitControls = require('three-orbit-controls')(THREE);

import ENTITIES from './entities.js';

// shaders

const VSHADER_NOISE = `
varying vec2 coord;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  coord = vec2(position.x, position.z)*25.0;
}
`;

const FSHADER_NOISE = `
varying vec2 coord;

float rand(vec2 c){
	return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float noise(vec2 p, float freq ){
	float unit = 256.0/freq;
	vec2 ij = floor(p/unit);
	vec2 xy = mod(p,unit)/unit;
	//xy = 3.*xy*xy-2.*xy*xy*xy;
	xy = .5*(1.-cos(3.14159265*xy));
	float a = rand((ij+vec2(0.,0.)));
	float b = rand((ij+vec2(1.,0.)));
	float c = rand((ij+vec2(0.,1.)));
	float d = rand((ij+vec2(1.,1.)));
	float x1 = mix(a, b, xy.x);
	float x2 = mix(c, d, xy.x);
	return mix(x1, x2, xy.y);
}

float pNoise(vec2 p, int res){
	float persistance = .5;
	float n = 0.;
	float normK = 0.;
	float f = 4.;
	float amp = 1.;
	int iCount = 0;
	for (int i = 0; i<50; i++){
		n+=amp*noise(p, f);
		f*=2.;
		normK+=amp;
		amp*=persistance;
		if (iCount == res) break;
		iCount++;
	}
	float nf = n/normK;
	return nf*nf*nf*nf;
}

void main() {
  float alpha = clamp(pNoise(coord, 64)*10.0, 0.0, 0.9);
  gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
}
`;

function init() {

  // Set up scene.

  STATE.scene = new THREE.Scene();
  STATE.scene.background = new THREE.Color( 0x00000 );

  STATE.camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 1, 2000 );
  STATE.camera.position.set( 0, 0, 50 );
  STATE.controls = new OrbitControls( STATE.camera );

  STATE.clock = new THREE.Clock(false);

  // Load resources from file.
  ENTITIES.load(STATE);

}

function postload() {

  // Initialize resources.
  ENTITIES.init(STATE);

  // Set up scene graph.

  // Lights

  STATE.entities.light0 = new THREE.DirectionalLight( 0xA0A0A0 );
  STATE.entities.light0.position.set( 0.5, 0.5, 0.5 );
  STATE.scene.add( STATE.entities.light0 );

  STATE.entities.light1 = new THREE.AmbientLight( 0xA0A0A0 );
  STATE.scene.add( STATE.entities.light1 );

  // Objects

  STATE.scene.add(STATE.meshes.heightmap);
  STATE.scene.add(STATE.meshes.buildings);

  // Skybox

  let skygeo = new THREE.CubeGeometry( 1000, 1000, 1000 );
  let skyTex = [];
  skyTex.push( new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture( 'resources/sor_lake1/lake1_lf.jpg' ),
    side: THREE.BackSide
  }));
  skyTex.push( new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture( 'resources/sor_lake1/lake1_rt.jpg' ),
    side: THREE.BackSide
  }));
  skyTex.push( new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture( 'resources/sor_lake1/lake1_up.jpg' ),
    side: THREE.BackSide
  }));
  skyTex.push( new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture( 'resources/sor_lake1/lake1_dn.jpg' ),
    side: THREE.BackSide
  }));
  skyTex.push( new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture( 'resources/sor_lake1/lake1_ft.jpg' ),
    side: THREE.BackSide
  }));
  skyTex.push( new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture( 'resources/sor_lake1/lake1_bk.jpg' ),
    side: THREE.BackSide
  }));

  let skymat = new THREE.MeshFaceMaterial( skyTex );
  STATE.meshes.skybox = new THREE.Mesh( skygeo, skymat );
  STATE.scene.add(STATE.meshes.skybox);

  // "Ocean"

  STATE.reflection = new THREE.CubeCamera( 1, 5000, 512 );
  STATE.reflection.position.set(0, -10, 0);
  STATE.scene.add( STATE.reflection );

  let oceangeo = new THREE.PlaneBufferGeometry( 100, 100, 8 );
  let oceanmat = new THREE.MeshLambertMaterial({ color: 0xffffff, envMap: STATE.reflection.renderTarget });
  STATE.meshes.ocean = new THREE.Mesh( oceangeo, oceanmat );

  STATE.height = -13;

  STATE.meshes.ocean.position.set(0, STATE.height, 0);
  STATE.scene.add(STATE.meshes.ocean);

  // Clouds

  let cloudgeo = new THREE.CubeGeometry( 24, 1, 32 );
  STATE.cloudx = 0;
  STATE.cloudy = 0;
  STATE.cloudz = 0;
  let cloudmat = new THREE.ShaderMaterial({
    vertexShader: VSHADER_NOISE,
    fragmentShader: FSHADER_NOISE
  });
  cloudmat.transparent = true;
  STATE.meshes.cloud = new THREE.Mesh( cloudgeo, cloudmat );
  STATE.scene.add(STATE.meshes.cloud);

  // Renderer

  STATE.renderer = new THREE.WebGLRenderer();
  STATE.renderer.setPixelRatio( window.devicePixelRatio );
  STATE.renderer.setSize( window.innerWidth, window.innerHeight );

  STATE.composer = new EffectComposer(STATE.renderer);

  STATE.passes.renderPass = new RenderPass(STATE.scene, STATE.camera);
  STATE.passes.renderPass.renderToScreen = true;
  STATE.composer.addPass(STATE.passes.renderPass);

  let container = document.getElementById('app');
  container.appendChild( STATE.renderer.domElement );

  let gui = new dat.GUI();
  gui.add(STATE, 'height', -25, -5);
  gui.add(STATE, 'cloudx', -25, 25);
  gui.add(STATE, 'cloudy', -5, 25);
  gui.add(STATE, 'cloudz', -25, 25);

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
  STATE.meshes.ocean.position.set(0, STATE.height, 0);
  STATE.meshes.heightmap.rotation.set(0, elapsedTime*0, 0);
  STATE.meshes.skybox.rotation.set(0, elapsedTime*0, 0);
  STATE.meshes.cloud.position.set(-STATE.cloudx, STATE.cloudy, STATE.cloudz);
  STATE.meshes.ocean.rotation.set(-Math.PI*0.5, 0, elapsedTime*0);
  STATE.meshes.buildings.rotation.set(-Math.PI*0.5, 0, elapsedTime*0);

  STATE.reflection.update( STATE.renderer, STATE.scene );

  ENTITIES.update(deltaTime);
  STATE.keyboard.update( deltaTime );
  STATE.controls.update();
}

function render(deltaTime) {
  STATE.composer.render(deltaTime);
}

// Events

function onKeyDown(evt) {
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
