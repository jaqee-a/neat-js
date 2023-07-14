



export abstract class InnovationFactory {

    private static COUNTER: number = 0;

    static GenNewInnovationNumber(): number {
        return this.COUNTER++;
    }

}
