import {Injectable} from "@angular/core";

@Injectable()
export class StorageService {

    /** Reference to local storage.  */
    private storage : Storage = window.localStorage;

    /**
     * Writes the provided object to the local store. If an object for that key
     * already exists, the existing object will be overwritten.
     *
     * Type information is lost when persisting objects through this method!
     *
     * @param key Key under which the object should be saved.
     * @param object Object that should be persisted.
     * @return {boolean} true if object was persisted and false otherwise.
     */
    public writeObjectForKey(key: string, object: any) {
        if (typeof object !== 'object') return false;
        let data = JSON.stringify(object);
        this.storage.setItem(key, data);
        return true;
    }

    /**
     * Reads the object saved under the given key from the local store and returns it. If no such
     * object exists, the method will return null.
     *
     * No type information is associated with the returned object!
     *
     * @param key Key for which an object should be returned.
     * @return {any|null} The object or null if no object exists for the key.
     */
    public readObjectForKey(key: string): any {
        let data = this.storage.getItem(key);
        if (data) {
            return JSON.parse(data);
        } else {
            return null;
        }
    }

    /**
     * Writes the provided primitive (e.g. string, number) to the local store. If a value for
     * that key already exists, the existing value will be overwritten.
     *
     * @param key Key under which the value should be saved.
     * @param primitive Value that should be persisted.
     * @return {boolean} } true if value was persisted and false otherwise.
     */
    public writePrimitiveForKey(key: string, primitive: any) : boolean {
        if (typeof primitive === 'object') return false;
        this.storage.setItem(key, primitive);
        return true;
    }


    /**
     * Reads a primitive value (e.g. a string or number) saved under the provided key
     * from the local storage and returns it.
     *
     * @param key Key for which an object should be returned.
     * @return {string|null} The value or null if no value exists for the key.
     */
    public readPrimitiveForKey(key: string): any {
        return this.storage.getItem(key);
    }

    /**
     * Pushes an object to the array specified by the provided key. If no such array
     * exists, one is created. However, if the specified key is occupied by another type
     * of object that object will not be replaced.
     *
     * @param key Key of the array to which an object should be pushed.
     * @param object Object that should be pushed.
     */
    public pushToArrayForKey(key: string, object: any): boolean {
        let array = this.readObjectForKey(key);
        if (array instanceof Array) {
            array.push(object);
            this.writeObjectForKey(key, array);
            return true;
        } else if (array == null) {
            this.writeObjectForKey(key, [object]);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Returns the size of the array. If no array exists under the provided key, this
     * method returns -1.
     *
     * @param key
     */
    public sizeOfArray(key: string) : number {
        let array = this.readObjectForKey(key);
        if (array instanceof Array) {
            return array.length
        } else {
            return -1;
        }
    }

    /**
     * Checks if the provided key exists in the local storage.
     *
     * @param key Key that should be checked.
     */
    public has(key: string) {
        return this.storage.getItem(key) != null;
    }

    /**
     * Removes the specified item from the local storage.
     *
     * @param key Key of the item that should be removed.
     */
    public remove(key: string) {
        return this.storage.removeItem(key);
    }

    /**
     * Returns true if local-storage is supported by the current browser and
     * false otherwise.
     *
     * @return {boolean}
     */
    public supported(): boolean {
        return (typeof Storage !== "undefined")
    }
}