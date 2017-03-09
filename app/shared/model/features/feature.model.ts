export class Feature {

    public color : string;
    public weight: number;

    /**
     *
     * @param name
     * @param readableName
     * @param defaultWeight
     */
    public constructor(readonly name: string, readonly readableName: string, readonly defaultWeight: number) {
        this.color = this.getRandomColor();
        this.weight = defaultWeight;
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
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color
    }
}