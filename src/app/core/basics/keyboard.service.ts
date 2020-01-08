import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {DOCUMENT} from '@angular/common';
import {EventManager} from '@angular/platform-browser';

@Injectable({providedIn: 'root'})
export class KeyboardService {

  public ctrlPressed: BehaviorSubject<boolean>;

  private _ctrlDown = false;

  constructor(private eventManager: EventManager,
              @Inject(DOCUMENT) private document: Document) {

    this.eventManager.addEventListener(this.document.body, 'keydown', this.handleKeyDown);
    this.eventManager.addEventListener(this.document.body, 'keyup', this.handleKeyUp);

    this.ctrlPressed = new BehaviorSubject(false);
  }

  /* This **has** to be a lambda to retain scope */
  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Control' && !this._ctrlDown) {
      this._ctrlDown = true;
      this.ctrlPressed.next(true)
    }
  }

  private handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Control') {
      this._ctrlDown = false;
      this.ctrlPressed.next(false)
    }
  }
}
