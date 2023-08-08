import { Component, OnInit, ElementRef, NgZone } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as CITIES from './capitals.json';
import axios from 'axios';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { WorldService } from '../world.service';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

import { text } from 'express';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.scss'],
})
export class WorldComponent implements OnInit {
  private renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
  private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
  private scene: THREE.Scene = new THREE.Scene();
  private controls: OrbitControls = new OrbitControls(
    this.camera,
    this.renderer.domElement
  );
  public world: any;
  public city: string;
  public country: string;
  public latitude: string;
  public longitude: string;

  public showLabels: boolean = false;
  public imageSrc: string;
  originalMaterial: THREE.MeshBasicMaterial;
  markerSelected: any;

  private mouse: THREE.Vector2 = new THREE.Vector2();
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  public allCities: any;
  public previousObj: any;
  public selected: any = [];
  public allMarkers: any[] = [];
  public markerInfo: any;
  keysArray: string[];
  flagUrl;

  constructor(
    private ngZone: NgZone,
    private el: ElementRef,
    private worldService: WorldService
  ) {
    this.el.nativeElement.addEventListener(
      'mousemove',
      (event) => {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      },
      false
    );

    this.el.nativeElement.addEventListener(
      'mousedown',
      (event) => {
        this.onMouseDown(event);
      },
      false
    );
  }

  ngOnInit() {
    this.imageSrc = '../../assets/placeholder-image.png';
    this.initTHREE();
    this.animate();
    this.getCapitals();
  }

  async getCapitals() {
    this.allCities = await this.worldService.getCapitalsFromDb('japan');
    if (!this.allCities) return;
    this.allCities.data.forEach((marker) => {
      this.addAllCapitals(marker);
    });
  }

  private initTHREE() {
    // initialize scene, camera, and renderer
    this.scene = new THREE.Scene();
    // this.camera = new THREE.PerspectiveCamera(
    //   80,
    //   window.innerWidth / window.innerHeight,
    //   0.08,
    //   2000
    // );

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      2000
    );

    this.scene.background = new THREE.Color(0xabcdef); // Set the hexadecimal color value

    this.camera.setFocalLength(15);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.el.nativeElement.appendChild(this.renderer.domElement);

    // add lighting
    // add earth
    let geometry = new THREE.SphereGeometry(1, 32, 32);
    let texture = new THREE.TextureLoader().load('assets/earth8k.jpg');

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    let normalMap = new THREE.TextureLoader().load('assets/normalEarth.tif');

    const exrLoader = new EXRLoader();
    exrLoader.setDataType(THREE.FloatType); // Set the desired data type

    exrLoader.load('assets/evr.exr', (texture) => {
      // Use the loaded texture as the environment map
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.environment = texture;
    });

    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.6,
      metalness: 0.7,
      map: texture,
    });
    let earth = new THREE.Mesh(geometry, material);
    this.scene.add(earth);
    let light2 = new THREE.AmbientLight('white', 0.6);
    light2.castShadow = true;
    this.scene.add(light2);

    this.renderer.shadowMap.enabled = true;

    earth.receiveShadow = true;
    earth.castShadow = true;
    // initialize controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05; // Adjust the damping factor to control the smoothness

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 2.0; // Adjust the exposure to control the overall brightness

    this.camera.position.z = 2;
    this.world = earth;
  }

  public async addAllCapitals(markerData) {
    const lat = THREE.MathUtils.degToRad(markerData.latitude); // latitude for Mexico City
    const lon = THREE.MathUtils.degToRad(markerData.longitude); // longitude for Mexico City
    const radius = 1; // Replace with the radius of your Earth model

    const phi = Math.PI / 2 - lat; // this will range from 0 to pi
    const theta = Math.PI * 2 - lon; // this will range from 0 to 2pi

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    // Create the marker
    const markerGeometry = new THREE.SphereGeometry(0.01, 16, 16); // Adjust size as needed

    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'Anonymous';
    let texture;
    this.countryFlag(markerData.abbreviation);
    this.flagUrl
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          texture = textureLoader.load(data[0].flags.png);

          const markerMaterial = new THREE.MeshPhongMaterial({ map: texture });
          this.originalMaterial = markerMaterial;
          const marker = new THREE.Mesh(markerGeometry, markerMaterial);
          marker.userData['flagLink'] = data[0].flags.png;

          // Position the marker and add it to the scene
          marker.position.set(x, y, z);
          marker.name = markerData.country;
          marker.userData['flagUrl'] = texture;
          this.allMarkers.push(marker);
          this.scene.add(marker);
        }
        // Use the flag URL as needed
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    // const texture = textureLoader.load(this.flagUrl[0].flags.png);
  }

  async countryFlag(countryAbbreviation) {
    if (!countryAbbreviation) return;
    this.flagUrl = fetch(
      `https://restcountries.com/v3.1/alpha/${countryAbbreviation}`
    );
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera);
    this.controls.update();

    if (this.markerSelected) {
      this.previousObj = this.markerSelected;
    }
    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    for (let i = 0; i < intersects.length; i++) {
      // Check if the intersected object is a marker
      if (intersects[i].object.name) {
        this.markerSelected = intersects[i].object as THREE.Mesh;
        // Display label
      } else {
      }
    }
  }

  onMouseDown(event: MouseEvent) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    for (let i = 0; i < intersects.length; i++) {
      // Check if the intersected object is a marker
      if (intersects[i].object.name) {
        // Handle marker click
        this.onMarkerClick(intersects[i].object);
      }
    }
  }

  resetData() {
    this.city = '';
    this.country = '';
    this.longitude = '';
    this.latitude = '';
  }

  onMarkerClick(object: THREE.Object3D) {
    const city = this.allCities.data.find(
      (country) => country.country === object.name
    );
    for (let key of Object.keys(city)) {
      object.userData[key] = city[key];
    }

    this.imageSrc = object.userData['flagLink'];
    this.keysArray = Object.keys(object.userData);
    this.markerInfo = object.userData;

    // axios.get(`https://api.teleport.org/api/urban_areas/slug:${city.toLocaleLowerCase()}/images/`)
    // .then(elem => {
    //   console.log(elem);
    //   this.imageSrc = elem.data.photos[0].image.web;
    // })
    // .catch(e => console.log("Error: ", e))
    if (object.userData['isMarked']) {
      // this.selected.find(obj => obj !== object.name).material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      // const idx = this.selected.indexOf(obj => obj === object.name);
      // console.log(idx);
      // this.selected.splice(idx, 1);
      // (object as THREE.Mesh).material  = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      object.userData['isMarked'] = false;
      this.showLabels = false;

      this.resetData();
      return;
    }
    this.allMarkers.find((elem) => elem.name === object.name).material =
      new THREE.MeshPhongMaterial({ opacity: 0.1 });

    this.showLabels = true;
    object.userData['isMarked'] = true;
    this.selected.push(object);
    this.selected.forEach((obj) => {
      (obj as THREE.Mesh).material = new THREE.MeshPhongMaterial({
        map: obj.userData['flagUrl'],
        transparent: true,
        opacity: 0.5,
      });
    });
    this.allMarkers.forEach((obj) => {
      if (obj.name === object.name) return;
      (obj as THREE.Mesh).material = new THREE.MeshBasicMaterial({
        map: obj.userData['flagUrl'],
      });
    });
  }

  private showLabel(marker) {
    // Create and style label div
    const city = this.allCities.find((city) => city.city === marker.name);
    this.latitude = city.latitude;
    this.longitude = city.longitude;
    this.city = city.largest_city;
    this.country = city.country;
  }
}
