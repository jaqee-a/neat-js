"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Genome_1 = require("../src/Genome");
const genome = new Genome_1.Genome(3, 4);
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
console.log(genomeClone.calculateOutput([Math.random(), Math.random(), Math.random()]));
