import {Injectable} from "@angular/core";
import {Model3DFileLoader} from "../../shared/util/m3d-file-loader.util";

import Scene = THREE.Scene;
import Camera = THREE.Camera;
import WebGLRenderer = THREE.WebGLRenderer;
import Mesh = THREE.Mesh;
import LoadingManager = THREE.LoadingManager;
import OrbitControls = THREE.OrbitControls;
import Geometry = THREE.Geometry;
import Object3D = THREE.Object3D;
import PerspectiveCamera = THREE.PerspectiveCamera;
import TrackballControls = THREE.TrackballControls;

@Injectable()
export class M3DRenderService {
    /** THREE Scene containing the active mesh. */
    protected scene: Scene;

    /** THREE camera. */
    protected camera: PerspectiveCamera;

    /** WebGLRenderer reference. */
    protected renderer: WebGLRenderer;

    /** Currently active Mesh that's being displayed by the M3DRendererService. */
    protected mesh: Mesh;

    protected manager: LoadingManager;

    /** Width of the rendering-context in pixels. */
    protected width: number;

    /** Height of the rendering-context in pixels. */
    protected height: number;

    /**
     * This method can be used to initialize the context. It should only be
     * invoked once.
     *
     * @param container HTML element that will contain the canvas on which the rendered content is going to be displayed.
     * @param width Width of the rendering context.
     * @param height Height of the rendering context.
     */
    public init(container: HTMLElement, width: number, height: number) {
        this.scene = new THREE.Scene();

        this.width = width;
        this.height = height;

        this.manager = new THREE.LoadingManager();
        this.manager.onProgress = (item, loaded, total) => {
            console.log(item, loaded, total );
        };

        this.initCamera();
        this.initRenderer();
        container.appendChild(this.renderer.domElement);
    }

    /**
     * Disposes the renderer.
     */
    public deinit() {
        if (this.mesh) this.scene.remove(this.mesh);
        this.mesh = null;
        this.scene = null;
        this.camera = null;
        this.renderer.dispose();
        this.renderer = null;
    }

    /**
     * Tries to load a Mesh from a provided File, using the Model3DFileLoader class.
     *
     * @param file File to load the mesh from.
     */
    public loadMesh(file: File) {
        Model3DFileLoader.loadFile(file, (mesh : Mesh) => this.setMesh(mesh), this.manager);
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
        if (this.mesh) this.scene.remove(this.mesh);

        /* Set new mesh and add it to scene. */
        this.mesh = mesh;
        this.scene.add(this.mesh);
        this.mesh.geometry.center();

        /* Fit camera to object. */
        this.fitToObject();

        /* Render the object. */
        this.render();
    }

    /**
     * Forces the renderer to render the scene using the current camera
     * settings.
     */
    public render() {
        if (this.renderer) this.renderer.render(this.scene, this.camera);
    }

    /**
     * Fits the camera to the currently active Mesh so as to make sure, that the
     * Mesh fills the available field of view. If no Mesh has been set, this
     * method has no effect!
     */
    public fitToObject() {
        if (this.mesh) {
            this.mesh.geometry.computeBoundingSphere();
            let radius = this.mesh.geometry.boundingSphere.radius;
            let fov = ((this.camera.fov * Math.PI)/180);
            let distanceFactor = Math.abs((this.width/this.height) * radius / Math.sin( fov/2 ));
            this.camera.position.set(0, distanceFactor, 1.1 * distanceFactor);
            this.camera.lookAt(this.mesh.position);
        }
    }

    /**
     * Initializes the camera to the default settings.
     */
    private initCamera() {
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.01, 100);
        this.camera.position.set(0, 1, 1);
        this.camera.lookAt(this.scene.position);
    }

    /**
     * Initializes the renderer to the default settings.
     */
    private initRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
    }
}
