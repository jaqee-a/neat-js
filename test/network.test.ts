import { Genome } from "../src/Genome";




const genome = new Genome(3, 4);

genome.constructTopologicalNetwork();
genome.mutate();
genome.constructTopologicalNetwork();
genome.mutate();
genome.constructTopologicalNetwork();
genome.mutate();
genome.constructTopologicalNetwork();
genome.mutate();
genome.constructTopologicalNetwork();
genome.mutate();
genome.constructTopologicalNetwork();
genome.mutate();
genome.constructTopologicalNetwork();
genome.mutate();
genome.constructTopologicalNetwork();
genome.mutate();
genome.constructTopologicalNetwork();
genome.mutate();
genome.constructTopologicalNetwork();
genome.printNetwork();

const genomeClone = genome.clone();
console.log(genomeClone);

genomeClone.constructTopologicalNetwork();

console.log(genome.calculateOutput([Math.random(), Math.random(), Math.random()]));
