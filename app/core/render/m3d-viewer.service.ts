import {Injectable} from "@angular/core";
import {M3DRenderService} from "./m3d-render.service";
import TrackballControls = THREE.TrackballControls;
import Mesh = THREE.Mesh;


@Injectable()
export class M3DViewerService extends M3DRenderService {

    private controls: TrackballControls;

    /** */
    private rotate: boolean = false;

    /**
     *
     * @param container
     * @param width
     * @param height
     */
    public init(container: HTMLElement, width: number, height: number) {
        super.init(container, width, height);

        /** */
        this.initControls();
        this.animate();
    }

    /**
     * Initializes the TrackballControls to the default settings.
     */
    private initControls() {
        this.controls = new THREE.TrackballControls( this.camera );
        this.controls.rotateSpeed = 3;
        this.controls.zoomSpeed = 3;
        this.controls.panSpeed = 1.0;
        this.controls.noZoom = false;
        this.controls.noPan = false;
        this.controls.staticMoving = true;
        this.controls.dynamicDampingFactor = 0.3;

        this.controls.keys = [ 65, 83, 68 ];
        this.controls.addEventListener( 'change', () => this.render() );
    }

    /**
     * This method is called for every animation frame. It updates the
     * TrackballControls and animates the rotation of the object.
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

    /**
     *
     */
    public toggleRotate() {
        this.rotate = !this.rotate;
    }

    /**
     *
     * @param mesh
     */
    public setMesh(mesh: Mesh) {
        this.reset();
        super.setMesh(mesh);
    }

    /**
     *
     */
    public reset() {
        this.rotate = false;

        /* Reset the camera. */
        this.camera.position.set(0, 1, 1);
        this.camera.lookAt(this.scene.position);

        /* Reset the object and the camera with respect to the object. */
        if (this.mesh) {
            this.mesh.geometry.center();
            this.fitToObject()
        }

        /* Render the change. */
        this.render();
    }
}
