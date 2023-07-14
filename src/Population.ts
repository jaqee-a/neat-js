import { Genome } from "./Genome";




type fitnessFunction<T> = (p: T) => number;

export class Population<PlayerClass> {

    private generationNumber: number;

    constructor(private fitnessFn: fitnessFunction<PlayerClass>) {
        this.generationNumber = 0;
    }


    selection() { }

    reproduction() {}

    crossover() { }

    mutation() { }

}
