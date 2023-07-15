import { Genome } from "../src/Genome";




const genome = new Genome(3, 4);

genome.mutate();
genome.mutate();
genome.mutate();
genome.mutate();
genome.mutate();
genome.mutate();
genome.mutate();
genome.mutate();
genome.mutate();
genome.constructTopologicalNetwork();
genome.printNetwork();
