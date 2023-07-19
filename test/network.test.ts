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

genomeClone.constructTopologicalNetwork();
// console.log(Array.from(genomeClone.nodes.values()).filter((n)=>n.type==='OUTPUT'))

const randoms = [Math.random(), Math.random(), Math.random()];
console.log(genomeClone.calculateOutput(randoms));
