import { InnovationFactory } from "./Innov";

type NodeType = 'INPUT' | 'OUTPUT' | 'HIDDEN';
type ActivationFunction = (x: number) => number;

interface Connection {
    in: number;
    out: number;
    weight: number;
    enabled: boolean;
    innov: number;
}

interface Node {
    id: number;
    type: NodeType;
    activation: ActivationFunction;
    valueBeforeActivation: number;
    valueAfterActivation: number;
    // layerNumber: number;
}

// const ReLU: ActivationFunction = (x: number): number => { return (x > 0 ? 1 : 0) * x; }
const Sigmoid: ActivationFunction = (x: number): number => { return 1 / (1 + Math.exp(-x)); }

// Allowed Connections
// INPUT -> HIDDEN
// INPUT -> OUTPUT
// HIDDEN -> OUTPUT

export class Genome {

    private nodes: Map<number, Node>;
    // INNOV -> CONNECTION
    private connectionsLUT: Map<number, Connection>;

    private connections: Array<Connection>;
    private inputNodes: Array<Node>;

    private _node_count: number;

    // DONE
    constructor(private inputCount: number,
                private outputCount: number,
                initialize: boolean = true) {
        
        this.nodes = new Map<number, Node>();

        this.connectionsLUT = new Map<number, Connection>();
        this.connections = new Array<Connection>();

        this.inputNodes = new Array<Node>(this.inputCount);

        this._node_count = 0;

        if(initialize)
        this.createInitialNodes();
    }

    // DONE
    private createInitialNodes() {
        for(let i = 0; i < this.inputCount; ++i) {
            const node: Node = {
                id: i,
                type: 'INPUT',
                activation: Sigmoid,
                valueAfterActivation: 0,
                valueBeforeActivation: 0
            };

            for(let j = 0; j < this.outputCount; ++j) {
                const connection: Connection = {
                    in: i,
                    out: this.inputCount + j,
                    weight: Math.random(),
                    enabled: true,
                    innov: (this.outputCount * i) + j
                }
                this.addConnection(connection);
            }

            this.nodes.set(i, node);
            this.inputNodes.push(node);
        }
        

        for(let i = 0; i < this.outputCount; ++i) {
            const node: Node = {
                id: this.inputCount + i,
                type: 'OUTPUT',
                activation: Sigmoid,
                valueBeforeActivation: 0,
                valueAfterActivation: 0
            }
            this.nodes.set(i, node);
        }

        this._node_count = this.inputCount + this.outputCount;
    }

    private getUnconnectedNodes(): [number, number] {
        return [0, 0];
    }

    // DONE
    private addConnectionMutation() {
        const [node1, node2] = this.getUnconnectedNodes();
        const newConnection: Connection = {
            innov: InnovationFactory.GenNewInnovationNumber(),
            weight: Math.random(),
            enabled: true,
            in: node1,
            out: node2
        };
        this.addConnection(newConnection);
    }

    // DONE
    private getRandomEnabledConnection(): Connection {
        const enabledConnections: Array<Connection> = this.connections.filter((connection: Connection) => connection.enabled);
        return enabledConnections[(Math.random() * enabledConnections.length) >> 0];
    }

    // DONE
    private addNodeMutation() {
        const randConnection = this.getRandomEnabledConnection();

        const node: Node = {
            id: this._node_count,
            type: 'HIDDEN',
            valueAfterActivation: 0,
            valueBeforeActivation: 0,
            activation: Sigmoid
        };

        const conn1: Connection = {
            in: randConnection.in,
            out: node.id,
            enabled: true,
            weight: 1,
            innov: InnovationFactory.GenNewInnovationNumber()
        }

        const conn2: Connection = {
            in: node.id,
            out: randConnection.out,
            enabled: true,
            weight: Math.random(),
            innov: InnovationFactory.GenNewInnovationNumber()
        }

        randConnection.enabled = false;
        

        this.addConnection(conn1);
        this.addConnection(conn2);
        this.addNode(node);
    }

    // DONE
    addNode(node: Node) {
        if(this.nodes.has(node.id)) {
            throw new Error('Node already exist in the genome');
        }
        this.nodes.set(node.id, node);
        if(node.type === 'INPUT'){ 
            this.inputNodes.push(node);
            ++this.inputCount;
        }
        ++this._node_count;
    }

    // DONE
    addConnection(connection: Connection) {
        this.connections.push(connection);
        this.connectionsLUT.set(connection.innov, connection);
    }

    mutate(): void {
        const rnd: number = Math.random();

        if(rnd < 0.25) {
            this.addConnectionMutation();
        }else if(rnd < 0.5) {
            this.addNodeMutation();
        }
    }

    // DONE
    crossover(parent2: Genome): Genome {
        const child: Genome = this.clone();

        const parent2Connections: Array<Connection> = parent2.getConnections();

        for(const parent2Connection of parent2Connections) {
            if(this.connectionsLUT.has(parent2Connection.innov)) {

                const connection = child.getConnection(parent2Connection.innov)!;
                connection.enabled = parent2Connection.enabled && connection.enabled;

                continue;
            }
            
            child.addConnection(parent2Connection);
        }

        return child;
    }

    // DONE
    clone(): Genome {
        const genome: Genome = new Genome(this.inputCount, this.outputCount, false);
        this.connections.forEach((connection: Connection) => genome.addConnection({...connection}));
        this.nodes.forEach((node: Node) => genome.addNode({...node}));
        return genome;
    }


    calculateOutput(inputs: Array<number>): number {
        let output: number = 0;

        if(inputs.length !== this.inputNodes.length) throw new Error("Input vector length does not match input nodes count");
       
        const sortedConnections: Connection[] = this.connections.sort((a: Connection, b: Connection) => {
            return a.out - b.out;
        });

        for(let i = 0; i < this.inputNodes.length; ++i) {
            this.inputNodes[i].valueAfterActivation = inputs[i];
        }

        for(const connection of sortedConnections) {
            if(!connection.enabled) continue;

            if(!this.nodes.has(connection.in))
                throw new Error(`Node with id ${connection.in} does not exist while a connection from that node exist`);

            if(!this.nodes.has(connection.out))
                throw new Error(`Node with id ${connection.out} does not exist while a connection into that node exist`);

            const inNode: Node = this.nodes.get(connection.in)!;
            const outNode: Node = this.nodes.get(connection.out)!;
            
        }

        return output;
    }


    getConnection(innov: number): Connection | undefined {
        return this.connectionsLUT.get(innov);
    }

    getConnections(): Array<Connection> {
        return this.connections;
    }
}


