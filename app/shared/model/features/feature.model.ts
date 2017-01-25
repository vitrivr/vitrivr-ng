export class Feature {

    public color : string;

    public constructor(readonly name: string, readonly readableName: string,
                       readonly defaultWeight: number, public weight: number) {
        this.color = this.getRandomColor()
    }

    toString(): string {
        return this.name;
    }

    /**
     *
     * @param features
     */
    public static totalWeight(features: Feature[]): number {
        return features.map(f => f.weight).reduce((a,b) => a+b);
    }

    /**
     *
     * @returns {string}
     */
    public getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color
    }
}