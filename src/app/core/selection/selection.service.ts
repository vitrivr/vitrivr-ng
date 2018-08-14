import {Injectable} from "@angular/core";
import {ConfigService} from "../basics/config.service";
import {Tag} from "./tag.model";
import {BehaviorSubject} from "rxjs";

/**
 * This service orchestrates similarity requests using the Cineast API (WebSocket). The service is responsible for
 * issuing findSimilar requests, processing incoming responses and ranking of the requests.
 */
@Injectable()
export class SelectionService extends BehaviorSubject<Map<string,Set<Tag>>> {
    /** List of available Tag objects. */
    private readonly _available: Set<Tag> = new Set();

    /** A map of selected items identified by a string and the associated Tag objects. */
    private readonly _selections: Map<string,Set<Tag>> = new Map();

    /**
     * Constructor; injects the ConfigService.
     *
     * @param {ConfigService} _config
     */
    constructor(_config: ConfigService) {
        super(new Map());
        _config.subscribe(c => {
            this._available.clear();
            c.get<Tag[]>('tags').forEach(t => this.registerTag(t))
        });
    }

    /**
     * Adds a Tag to the provided identifier.
     *
     * @param {identifier} string The identifier for which to add the tag.
     * @param {Tag} tag The tag to add to the identifier. Must be contained in the AVAILABLE_TAGS set.
     */
    public add(identifier: string, tag: Tag) {
        if (!this._available.has(tag)) throw new Error("The provided Tag is not valid.");
        if (this._selections.has(identifier)) {
            this._selections.get(identifier).add(tag);
        } else {
            this._selections.set(identifier, new Set([tag]));
        }
        this.next(this._selections);
    }

    /**
     * Removes the provided Tag for the provided identifier. If all selection have been removed from the list, the identifier
     * is removed completely.
     *
     * @param {string} identifier Identifier for which to remove all tags.
     * @param {Tag} tag The Tag that should be removed.
     * @return true if tag for identifier was removed, false if either identifier was unknown OR did not contain that tag
     */
    public remove(identifier: string, tag: Tag): boolean {
        if (this._selections.has(identifier)) {
            let entry = this._selections.get(identifier);
            let success = entry.delete(tag);
            if (!success) return false;
            if (entry.size == 0) this._selections.delete(identifier);
            this.next(this._selections);
            return true;
        }
        return false;
    }

    /**
     *
     * @param {string} identifier
     * @param {Tag} tag
     */
    public toggle(identifier: string, tag: Tag) {
        if (this._selections.has(identifier) && this._selections.get(identifier).has(tag)) {
            this.remove(identifier, tag);
        } else {
            this.add(identifier, tag);
        }
    }


    /**
     * Removes all tags for the provided identifier.
     *
     * @param {string} identifier Identifier for which to remove all tags.
     * @return true if identifier was removed, false if it was not known.
     */
    public removeAll(identifier: string) {
        if(this._selections.delete(identifier)) {
            this.next(this._selections);
            return true;
        } else {
            return false;
        }
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
        let tags: Tag[] = [];
        if (this._selections.has(identifier)) {
            this._selections.get(identifier).forEach(t => tags.push(t));
        }
        return tags;
    }

    /**
     * Clears all Tags and identifiers stored in this SelectionService.
     */
    public clear() {
        this._selections.clear();
        this.next(this._selections);
    }

    /**
     *
     * @return {Tag[]}
     */
    get availableTags(): Tag[] {
        let tags: Tag[] = [];
        this._available.forEach(v1 => {
            tags.push(v1);
        });
        return tags;
    }

    /**
     * Registers the provided tag, thereby making it an available tag.
     *
     * @param {Tag} tag
     */
    public registerTag(tag: Tag) {
        this._available.add(tag);
    }
}