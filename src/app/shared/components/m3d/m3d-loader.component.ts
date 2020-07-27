import * as THREE from 'three'
import * as TrackballControls from 'three-trackballcontrols';

import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Model3DFileLoader} from '../../util/m3d-file-loader.util';
import Scene = THREE.Scene;
import Mesh = THREE.Mesh;
import LoadingManager = THREE.LoadingManager;
import WebGLRenderer = THREE.WebGLRenderer;
import PerspectiveCamera = THREE.PerspectiveCamera;

@Component({
  selector: 'm3d-loader',
  template: `
    <div #visualize></div>`
})

/**
 * This is a simple AudioRecordingComponent that uses navigator.getUserMedia to access the user's microphone. The
 * component comes without UI except for a visualization canvas. Therefore, it must be embedded by another
 * component in order to be useful.
 *
 * The component has public methods to start and stop recording or playback. Furthermore, one can manually load
 * data from an audio file.
 */
export class M3DLoaderComponent implements OnInit, OnDestroy {
  /** Width of the rendering context. */
  @Input() width: number = 400;

  /** Height of the rendering context. */
  @Input() height: number = 400;

  /** Indicates whether the loader should allow user interaction through controls. */
  @Input() interaction: boolean = false;

  /** Indicates whether the loader should allow user interaction through controls. */
  @Input() src: string = null;
  /** THREE Scene containing the active mesh. */
  protected scene: Scene;
  /** THREE camera. */
  protected camera: PerspectiveCamera;
  /** WebGLRenderer reference. */
  protected renderer: WebGLRenderer;
  /** THREE Loading Manager */
  protected manager: LoadingManager;
  /** Currently active Mesh that's being displayed by the M3DRendererService. */
  protected mesh: Mesh;
  /** Boolean indicating whether current model should auto-rotate. */
  private rotate: boolean = false;
  /** HTML element in which the rendering-context will be placed. */
  @ViewChild('visualize')
  private container: any;
  /** THREE Trackball Controls */
  private controls;

  constructor() {
  }

  /**
   * Lifecycle Hook (onInit): This method can be used to initialize the rendering context.
   */
  public ngOnInit(): void {
    this.scene = new THREE.Scene();
    this.manager = new THREE.LoadingManager();
    this.manager.onProgress = (item, loaded, total) => {
      console.log(item, loaded, total);
    };

    this.initCamera();
    this.initRenderer();
    if (this.interaction) {
      this.initControls();
    }
    this.container.nativeElement.appendChild(this.renderer.domElement);

    /* If src has been specified; Load the model file. */
    if (this.src != null) {
      this.loadMeshFromPath(this.src);
    }

    /* Start animation of render control. */
    this.render();
    this.animate();
  }

  /**
   * Lifecycle Hook (onDestroy):* Makes sure that the renderer is properly disposed.
   */
  public ngOnDestroy(): void {
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }
    this.mesh = null;
    this.scene = null;
    this.camera = null;
    this.renderer.dispose();
    this.renderer = null;

    /* Remove EventListener and reset the controls. */
    if (this.interaction) {
      this.controls.removeEventListener('change', null);
      this.controls = null;
    }
  }

  /**
   * Tries to load a Mesh from a provided File, using the Model3DFileLoader class.
   *
   * @param file File to load the mesh from.
   */
  public loadMeshFromFile(file: File) {
    Model3DFileLoader.loadFromFile(file, (mesh: Mesh) => this.setMesh(mesh), this.manager);
  }

  /**
   * Tries to load a Mesh from a provided URL or path.
   *
   * @param path Path to the file containing the Mesh.
   */
  public loadMeshFromPath(path: string) {
    Model3DFileLoader.loadFromPath(path, (mesh: Mesh) => this.setMesh(mesh), this.manager);
  }

  /**
   * Getter for the currently active Mesh.
   *
   * @returns {any}
   */
  public getMesh() {
    return this.mesh;
  }

  /**
   * Setter for a new Mesh. The method makes sure, that the old mesh is properly
   * disposed and adjusts the camera so as to make sure that the new Mesh is visible.
   *
   * @param mesh Mesh to display.
   */
  public setMesh(mesh: Mesh) {
    /* Remove old mesh. */
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }

    /* Reset view (camera, position etc.). */
    this.reset();

    /* Set new mesh and add it to scene. */
    this.mesh = mesh;
    this.scene.add(this.mesh);
    this.mesh.geometry.center();

    /* Fit camera to object. */
    this.fitObjectToCamera();

    /* Render the object. */
    this.render();
  }

  /**
   * Resets both the camera and the loaded object back to default
   * settings.
   */
  public reset() {
    this.rotate = false;

    /* Reset the camera. */
    this.camera.position.set(0, 1, 1);
    this.camera.lookAt(this.scene.position);

    /* Reset the object and the camera with respect to the object. */
    if (this.mesh) {
      this.mesh.geometry.center();
      this.fitObjectToCamera()
    }

    /* Render the change. */
    this.render();
  }

  /**
   * Toggles auto-rotation.
   */
  public toggleRotate() {
    this.rotate = !this.rotate;
  }

  /**
   * Forces the renderer to render the scene using the current camera
   * settings.
   */
  public render() {
    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Fits the camera to the currently active Mesh so as to make sure, that the
   * Mesh fills the available field of view. If no Mesh has been set, this
   * method has no effect!
   */
  public fitObjectToCamera() {
    if (this.mesh) {
      /* Compute bounding-sphere and its radius. */
      this.mesh.geometry.computeBoundingSphere();
      let radius = this.mesh.geometry.boundingSphere.radius;

      /* Set scale of object. */
      this.mesh.scale.set(1 / radius, 1 / radius, 1 / radius);

      /* Set camera-position. */
      let sqrt2 = Math.sqrt(2.0);
      this.camera.position.set(sqrt2, sqrt2, sqrt2);
      this.camera.lookAt(this.mesh.position);
    }
  }

  /**
   * Initializes the camera to the default settings.
   */
  private initCamera() {
    this.camera = new PerspectiveCamera(75, this.width / this.height, 0.01, 100);
    this.camera.position.set(0, 1, 1);
    this.camera.lookAt(this.scene.position);
  }

  /**
   * Initializes the renderer to the default settings.
   */
  private initRenderer() {
    this.renderer = new WebGLRenderer({antialias: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
  }

  /**
   * Initializes the TrackballControls to the default settings.
   */
  private initControls() {
    this.controls = new TrackballControls(this.camera, this.container.nativeElement);
    this.controls.rotateSpeed = 3;
    this.controls.zoomSpeed = 3;
    this.controls.panSpeed = 1.0;
    this.controls.noZoom = false;
    this.controls.noPan = false;
    this.controls.staticMoving = false;
    this.controls.dynamicDampingFactor = 0.3;

    this.controls.keys = [65, 83, 68];
    this.controls.addEventListener('change', () => this.render());
  }

  /**
   * This method is called for every animation frame. It updates the TrackballControls and animates
   * the rotation of the object.
   */
  private animate() {
    if (this.controls) {
      this.controls.update();
      requestAnimationFrame(() => this.animate());
    }

    if (this.rotate && this.mesh) {
      this.mesh.rotation.y += 0.05;
      this.render();
    }
  }
}
