import "./style.css";

import * as THREE from "three";

import Stats from "three/addons/libs/stats.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";

let camera, scene, renderer, raycaster

let container, stats;

let INTERSECTED;

const pointer = new THREE.Vector2();


init();

var scene_text_objects = []


animate();

function init() {
  /* 
  Think of init() as the function that sets up the scene. It loads in all the assets, 
  and prepares the camera and window as well as the renderer and camera controls
  */

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1
  );
  camera.position.set(0, 40, 10);
  camera.rotation.set(-35, 0, 0);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // Instantiate a loader
  const loader = new GLTFLoader();
  loader.load(
    // resource URL
    "assets/python_text_window.gltf",
    // called when the resource is loaded
    function (gltf) {
      scene.add(gltf.scene);

      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Group
      gltf.scenes; // Array<THREE.Group>
      gltf.cameras; // Array<THREE.Camera>
      gltf.asset; // Object

      render()
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function (error) {
      console.log("An error happened");
      console.log(error)
    }
  );
  raycaster = new THREE.Raycaster();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  stats = new Stats();
  container.appendChild( stats.dom );


  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  controls.addEventListener('change', render);

  document.addEventListener( 'mousemove', onPointerMove );

  window.addEventListener( 'resize', onWindowResize );

  // TODO: Remove background window element from intersectable objects:
  scene.traverse( function( object ) {
    if ( object.isMesh ) scene_text_objects.push( object );
  } );

  console.log("Scene_Text_Objects: " + scene_text_objects)
  
} // end init

function onPointerMove( event ) {

  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

function animate() {

  requestAnimationFrame( animate );

  render();
  stats.update();

}

function render() {
  camera.lookAt( scene.position );

  camera.updateMatrixWorld();

  // find intersections

  raycaster.setFromCamera( pointer, camera );
  
  const intersects = raycaster.intersectObjects( scene_text_objects, false );
  // Only objects Text --> Text393 should be included in 'intersects'


  if ( intersects.length > 0 ) {
    console.log(intersects)
    if ( INTERSECTED != intersects[ 0 ].object ) {

      if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex( 0xff0000 );

    }

  } else {

    if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

    INTERSECTED = null;

  }

  renderer.render( scene, camera );

  // Log objects in scene:
  // scene.traverse( function( object ) {
  //   if ( object.isMesh ) console.log( object );
  // } );
}
