export class BooleanLookupQuery {

    constructor(public readonly entity: string, public readonly attribute: string, public readonly values: any[], public readonly operator: string,
                public readonly componentID: number) {
    }
}