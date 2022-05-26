import Dexie from 'dexie';
import {Injectable} from '@angular/core';

@Injectable()
export class DatabaseService {
  /** The name of the IndexedDB used to store Vitrivr NG related objects. */
  public static readonly DB = new Dexie('vitrivrng');

  /**
   * Constructor for DatabaseService; initializes the database.
   */
  constructor() {
    DatabaseService.DB.version(1).stores({
      history: '++id,timestamp',
      log_results_dres: '++id,log',
      log_interaction_dres: '++id,log',
      log_submission_dres: '++id,log',
      log_results: '++id,entry',
      log_queries: '++id,entry',
    });
  }

  /**
   * Getter for the shared Dexie instance.
   */
  get db(): Dexie {
    return DatabaseService.DB;
  }
}
