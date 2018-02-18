import * as THREE from 'three';

import GLTFLoader from 'three-gltf2-loader';
GLTFLoader(THREE);

import OBJLoader from 'three-obj-loader';
OBJLoader(THREE);

export default class ENTITIES {

  static load ( STATE ) {

    STATE.loader.changeCount(2);

    let gltfloader = new THREE.GLTFLoader();
    let objloader = new THREE.OBJLoader();
    let texloader = new THREE.ImageLoader();

    gltfloader.load( 'resources/map_ucsc.gltf', ( gltf ) => {
      STATE.meshes.heightmap = gltf.scene.children[0];
      STATE.meshes.heightmap.position.set(0, -15, 0);
      STATE.meshes.heightmap.scale.set(50, 50, 50);
      STATE.loader.changeCount(-1);
    }, (xhr) => {
      if (xhr.lengthComputable) {
        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log( Math.round(percentComplete, 2) + '% downloaded' );
      }
    }, (xhr) => {
      console.log('Error loading gltf.');
      console.log(xhr);
    });

    objloader.load( 'resources/map_ucsc_buildings.obj', ( object ) => {
      STATE.meshes.buildings = object.children[0];
      STATE.meshes.buildings.position.set(0, -15, 0);
      STATE.meshes.buildings.scale.set(50, 50, 50);
      STATE.meshes.buildings.material = new THREE.MeshLambertMaterial({ color: 0xcccccc })
      STATE.loader.changeCount(-1);
    }, (xhr) => { // onProgress
      if (xhr.lengthComputable) {
        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log( Math.round(percentComplete, 2) + '% downloaded' );
      }
    }, (xhr) => { // onError
      console.log('Error loading gltf.');
      console.log(xhr);
    });

  }

  static init ( STATE ) { }

  static update ( STATE, deltaTime ) { }

}
