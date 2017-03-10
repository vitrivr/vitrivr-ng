import LoadingManager = THREE.LoadingManager;

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
        let loader =  new (THREE as any).OBJLoader(manager);
        loader.load(window.URL.createObjectURL(file), (object: any) => {
            if (object) {
                object.traverse((child : any) => {
                    if (child instanceof THREE.Mesh ) {
                        child.material = new THREE.MeshNormalMaterial();
                        callback(child);
                    }
                } );
            }
        });
    }

    /**
     * Tries to load a Mesh from the provided STL file. No prior checks are performed and the file
     * is directly handed to the THREE STLLoader class.
     *
     * @param file File object that should be loaded.
     * @param callback Callback function that will be executed once the file has been loaded.
     * @param manager LoadingManager to use together with the loader class.
     */
    public static loadSTLFile(file: File, callback : Function, manager?: LoadingManager) {
        let loader =  new (THREE as any).STLLoader(manager);
        loader.load(window.URL.createObjectURL(file), (geometry: any) => {
            if (geometry) {
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
    public static loadFile(file: File, callback : Function, manager?: LoadingManager) {
        let filename = file.name.toLowerCase();
        if (filename.endsWith(".obj")) {
            Model3DFileLoader.loadOBJFile(file, callback, manager);
        } else if (filename.endsWith(".stl")) {
            Model3DFileLoader.loadSTLFile(file, callback, manager);
        } else {
            console.log("File '" + filename + "' has an unsupported format.");
        }
    }
}