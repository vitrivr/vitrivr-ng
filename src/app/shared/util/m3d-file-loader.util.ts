import * as THREE from 'three';
import OBJLoader from 'three-obj-loader';
import STLLoader from 'three-stl-loader';

OBJLoader(THREE);
STLLoader(THREE);

import LoadingManager = THREE.LoadingManager;
import BufferGeometry = THREE.BufferGeometry;
import Geometry = THREE.Geometry;


export class Model3DFileLoader {
    /**
     * Tries to load a Mesh from the provided OBJ file. No prior checks are performed and the file
     * is directly handed to the THREE OBJLoader class.
     *
     * @param file File object that should be loaded.
     * @param callback Callback function that will be executed once the file has been loaded.
     * @param manager LoadingManager to use together with the loader class.
     */
    public static loadOBJFile(file: File, callback : Function, manager?: LoadingManager) {
        this.loadOBJFromPath(window.URL.createObjectURL(file), callback, manager)
    }

    /**
     * Tries to load a Mesh from the provided OBJ file. No prior checks are performed and the file
     * is directly handed to the THREE OBJLoader class.
     *
     * @param file File object that should be loaded.
     * @param callback Callback function that will be executed once the file has been loaded.
     * @param manager LoadingManager to use together with the loader class.
     */
    public static loadOBJFromPath(path: string, callback : Function, manager?: LoadingManager) {
        let loader = new (THREE as any).OBJLoader(manager);
        loader.load(path, (object: any) => {
            if (object) {
                let geometry: THREE.Geometry  = new THREE.Geometry();
                object.traverse((child : any) => {
                    if (child instanceof THREE.Mesh) {
                        child.updateMatrix();
                        if (child.geometry instanceof BufferGeometry) {
                            let partial = (new THREE.Geometry()).fromBufferGeometry( child.geometry );
                            geometry.merge(partial, child.matrix);
                        } else if (child.geometry instanceof Geometry) {
                            geometry.merge(child.geometry, child.matrix);
                        }
                    }
                });
                callback(new THREE.Mesh(geometry, new THREE.MeshNormalMaterial()));
            }
        })
    }


    /**
     * Tries to load a Mesh from the provided STL file. No prior checks are performed and the file
     * is directly handed to the THREE STLLoader class.
     *
     * @param file File object that should be loaded.
     * @param callback Callback function that will be executed once the file has been loaded.
     * @param manager LoadingManager to use together with the loader class.
     */
    public static loadSTLFromFile(file: File, callback : Function, manager?: LoadingManager) {
        Model3DFileLoader.loadSTLFromPath(window.URL.createObjectURL(file), callback, manager);
    }

    /**
     * Tries to load a Mesh from the provided STL file path. No prior checks are performed and the file
     * is directly handed to the THREE STLLoader class.
     *
     * @param path Path pointing to the 3D model file that should be loaded.
     * @param callback Callback function that will be executed once the file has been loaded.
     * @param manager LoadingManager to use together with the loader class.
     */
    public static loadSTLFromPath(path: string, callback: Function, manager?: LoadingManager) {
        let loader =  new (THREE as any).STLLoader(manager);
        loader.load(path, (geometry: any) => {
            if (geometry instanceof BufferGeometry) {
                callback(new THREE.Mesh(new THREE.Geometry().fromBufferGeometry(geometry), new THREE.MeshNormalMaterial()));
            } else if (geometry instanceof Geometry) {
                callback(new THREE.Mesh(geometry, new THREE.MeshNormalMaterial()));
            }
        });
    }

    /**
     * Tries to load a Mesh fro the provided file. Selects the appropriate Three loader class
     * based on the filename.
     *
     * @param file File object that should be loaded.
     * @param callback Callback function that will be executed once the file has been loaded.
     * @param manager LoadingManager to use together with the loader class.
     */
    public static loadFromFile(file: File, callback : Function, manager?: LoadingManager) {
        let filename = file.name.toLowerCase();
        if (filename.endsWith(".obj")) {
            Model3DFileLoader.loadOBJFile(file, callback, manager);
        } else if (filename.endsWith(".stl")) {
            Model3DFileLoader.loadSTLFromFile(file, callback, manager);
        } else {
            console.log("File '" + filename + "' has an unsupported format.");
        }
    }

    /**
     * Tries to load a Mesh fro the provided file. Selects the appropriate Three loader class
     * based on the filename.
     *
     * @param path Path pointing to the 3D model file that should be loaded.
     * @param callback Callback function that will be executed once the file has been loaded.
     * @param manager LoadingManager to use together with the loader class.
     */
    public static loadFromPath(path: string, callback : Function, manager?: LoadingManager) {
        if (path.endsWith(".obj")) {
            Model3DFileLoader.loadOBJFromPath(path, callback, manager);
        } else if (path.endsWith(".stl")) {
            Model3DFileLoader.loadSTLFromPath(path, callback, manager);
        } else {
            console.log("File '" + path + "' has an unsupported format.");
        }
    }
}