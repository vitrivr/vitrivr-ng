import {Injectable} from '@angular/core';
import {Tag} from './tag.model';
import {BehaviorSubject} from 'rxjs';
import {CollabordinatorService} from '../competition/collabordinator.service';
import {CollabordinatorMessage} from '../../shared/model/messages/collaboration/collabordinator-message.model';
import {AppConfig} from '../../app.config';

/**
 * This service orchestrates similarity requests using the Cineast API (WebSocket). The service is responsible for
 * issuing findSimilar requests, processing incoming responses and ranking of the requests.
 */
@Injectable()
export class SelectionService extends BehaviorSubject<Map<string, Set<Tag>>> {
  /** List of available Tag objects. */
  readonly _available: Tag[] = [];

  /** A map of selected items identified by a string and the associated Tag objects. */
  private readonly _selections: Map<string, Set<Tag>> = new Map();

  /**
   * Constructor; injects the ConfigService.
   *
   * @param {AppConfig} _config
   * @param {CollabordinatorService} _collabordinator
   */
  constructor(_config: AppConfig, private _collabordinator: CollabordinatorService) {
    super(new Map());
    _config.configAsObservable.subscribe(c => {
      this._available.length = 0;
      c.get<Tag[]>('tags').forEach(t => this._available.push(new Tag(t.name, t.hue)));
    });

    /* Register listener for Collabordinator. */
    _collabordinator.subscribe(msg => this.synchronize(msg));
  }

  /**
   * Adds a Tag to the provided identifier.
   *
   * @param {Tag} tag The tag to add to the identifier. Must be contained in the AVAILABLE_TAGS set.
   * @param {string} identifiers The identifiers for which to add the tag.
   */
  public add(tag: Tag, ...identifiers: string[]) {
    for (const identifier of identifiers) {
      if (!this._selections.has(identifier)) {
        this._selections.set(identifier, new Set([tag]));
      }
      this._selections.get(identifier).add(tag);
      this._collabordinator.add(tag, identifier);
      this.next(this._selections);
    }
    this._collabordinator.add(tag, ...identifiers)
  }

  /**
   * Removes the provided Tag for the provided identifier. If all selection have been removed from the list, the identifier
   * is removed completely.
   *
   * @param {Tag} tag The Tag that should be removed.
   * @param {string} identifiers Identifiers for which to remove the tag.
   * @return true if tag for identifier was removed, false if either identifier was unknown OR did not contain that tag
   */
  public remove(tag: Tag, ...identifiers: string[]) {
    for (const identifier of identifiers) {
      if (this._selections.has(identifier)) {
        const entry = this._selections.get(identifier);
        entry.delete(tag);
        if (entry.size === 0) {
          this._selections.delete(identifier);
        }
        this.next(this._selections);
      }
    }
    this._collabordinator.remove(tag, ...identifiers);
  }

  /**
   *
   * @param {Tag} tag The tag to toggle.
   * @param {string} identifiers The identifiers for which to toggle the tags.
   */
  public toggle(tag: Tag, ...identifiers: string[]) {
    const active = [];
    const inactive = [];
    for (const identifier of identifiers) {
      if (this._selections.has(identifier) && this._selections.get(identifier).has(tag)) {
        active.push(identifier);
      } else {
        inactive.push(identifier);
      }
    }
    this.remove(tag, ...active);
    this.add(tag, ...inactive);
  }

  /**
   * Returns true if there is at least one tag of the provided identifier.
   *
   * @param {string} identifier The identifier to check.
   */
  public isTagged(identifier: string) {
    return this._selections.has(identifier);
  }

  /**
   * Returns true if there provided identifier has the provided tag and false otherwise.
   *
   * @param {string} identifier The identifier to check.
   * @param {tag} tag The Tag that should be checked.
   */
  public hasTag(identifier: string, tag: Tag) {
    if (this._selections.has(identifier)) {
      return this._selections.get(identifier).has(tag);
    }
    return false;
  }

  /**
   * Returns an array of Tags for the provided identifier. May be empty.
   *
   * @param {string} identifier
   */
  public getTags(identifier: string): Tag[] {
    const tags: Tag[] = [];
    if (this._selections.has(identifier)) {
      this._selections.get(identifier).forEach(t => tags.push(t));
    }
    return tags;
  }

  /**
   * Clears all Tags and identifiers stored in this SelectionService.
   *
   * @param tag Optional Tag to remove. If null, all tags will be removed.
   */
  public clear(tag?: Tag) {
    if (tag) {
      this._selections.forEach((v, k) => {
        if (v.has(tag)) {
          v.delete(tag);
        }
        if (v.size === 0) {
          this._selections.delete(k);
        }
      });
      this._collabordinator.clear(tag);
    } else {
      this._selections.clear();
      for (const availableTag of this._available) {
        this._collabordinator.clear(availableTag);
      }
    }

    this.next(this._selections);
  }

  /**
   * Internal used to synchronize the SelectionService with Collabordinator signals.
   *
   * @param msg The CollabordinatorMessage being processed.
   */
  private synchronize(msg: CollabordinatorMessage) {
    /* Get tag that is affected. */
    let tag = null;
    for (const t of this._available) {
      if (t.name.toLowerCase() === msg.key.split('~')[1]) {
        tag = t;
        break;
      }
    }

    /* If no valid tag could be returned, move on. */
    if (!tag) {
      return;
    }

    /* Update tags according to submission. */
    switch (msg.action) {
      case 'ADD':
        msg.attribute.forEach(v => {
          if (!this._selections.has(v)) {
            this._selections.set(v, new Set());
          }
          this._selections.get(v).add(tag)
        });
        break;
      case 'REMOVE':
        msg.attribute.forEach(v => {
          if (this._selections.has(v)) {
            this._selections.get(v).delete(tag);
          } else if (this._selections.get(v).size === 0) {
            this._selections.delete(v);
          }
        });
        break;
      case 'CLEAR':
        this._selections.forEach((v, k) => {
          if (v.has(tag)) {
            v.delete(tag);
          }
          if (v.size === 0) {
            this._selections.delete(k);
          }
        });
        break;
    }
    this.next(this._selections);
  }
}
