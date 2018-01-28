import * as THREE from 'three';

import GLTFLoader from 'three-gltf2-loader';
GLTFLoader(THREE);

export default class ENTITIES {

  static load ( STATE ) {

    STATE.loader.changeCount(2);

    let loader = new THREE.GLTFLoader();

    loader.load( 'resources/astronaut.gltf', ( gltf ) => {
      STATE.meshes.astronaut = gltf.scene.children[0];
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

    loader.load( 'resources/donuts.gltf', ( gltf ) => {
      STATE.meshes.donuts = gltf.scene.children[0];
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
