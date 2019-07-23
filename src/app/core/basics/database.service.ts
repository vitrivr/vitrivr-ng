import Dexie from "dexie";

export class DatabaseService {
    /** The name of the IndexedDB used to store Vitrivr NG related objects. */
    public static readonly DB = new Dexie("vitrivrng");

    /**
     * Constructor for DatabaseService; initializes the database.
     */
    constructor() {
        DatabaseService.DB.version(1).stores({
            config: '',
            history: '++id,timestamp'
        });
    }

    /**
     * Getter for the shared Dexie instance.
     */
    get db(): Dexie {
        return DatabaseService.DB;
    }
}