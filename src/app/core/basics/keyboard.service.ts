import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {DOCUMENT} from '@angular/common';
import {EventManager} from '@angular/platform-browser';

/**
 * Service for general purpose keyboard events.
 */
@Injectable({providedIn: 'root'})
export class KeyboardService {

  /**
   * Whether the CTRL-Key is pressed (i.e. down) or not
   */
  public ctrlPressed: BehaviorSubject<boolean>;


  /**
   * Private flag if the CTRL-Key is down. Used to only process the down event, if not already down.
   */
  private _ctrlDown = false;

  /**
   * Constructor. EventManager and Document will be injected
   */
  constructor(private eventManager: EventManager,
              @Inject(DOCUMENT) private document: Document) {

    this.eventManager.addEventListener(this.document.body, 'keydown', this.handleKeyDown);
    this.eventManager.addEventListener(this.document.body, 'keyup', this.handleKeyUp);

    this.ctrlPressed = new BehaviorSubject(false);
  }

  /* This **has** to be a lambda to retain scope */
  /**
   * Event handler for keydown events.
   * Will be registered on the document.body element.
   * This event handler **has** to be a lambda, as otherwise the scope would not be retained
   * @param {KeyboardEvent} event The event that got fired
   */
  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Control' && !this._ctrlDown) {
      this._ctrlDown = true;
      this.ctrlPressed.next(true)
    }
  };

  /**
   * Event handler for keyup events.
   * Will be registered on the document.body element.
   * This event handler **has** to be a lambda, as otherwise the scope would not be retained.
   * @param event
   */
  private handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Control') {
      this._ctrlDown = false;
      this.ctrlPressed.next(false)
    }
  }
}
