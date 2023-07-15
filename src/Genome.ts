import { InnovationFactory } from "./Innov";

type NodeType = 'INPUT' | 'OUTPUT' | 'HIDDEN';
type ActivationFunction = (x: number) => number;

interface NodeByLayerOutput {
    maxLayerNumber: number;
    layerMap: Map<number, Array<Node>>;
}

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
    layerNumber: number;
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
                valueBeforeActivation: 0,
                layerNumber: 0
            };

            for(let j = 0; j < this.outputCount; ++j) {
                const connection: Connection = {
                    in: i,
                    out: this.inputCount + j,
                    weight: Math.random(),
                    enabled: true,
                    innov: -((this.outputCount * i) + j + 1)
                }
                this.addConnection(connection);
            }
        
            this.nodes.set(i, node);
            this.inputNodes[i] = node;
        }
        // console.log("CONNECTIONS NUMBER: ", this.connections.length);
        // console.log("INPUT NODES", this.inputNodes);
        
        

        for(let i = 0; i < this.outputCount; ++i) {
            const node: Node = {
                id: this.inputCount + i,
                type: 'OUTPUT',
                activation: Sigmoid,
                valueBeforeActivation: 0,
                valueAfterActivation: 0,
                layerNumber: 1
            }
            this.nodes.set(this.inputCount + i, node);
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

    constructTopologicalNetwork(): void {
        const inputIds: Array<number> = this.inputNodes.map((node: Node) => node.id);

        const inMap: Map<number, Array<number>> = new Map<number, Array<number>>();
        
        for(const connection of this.connections) {
            if(!inMap.has(connection.in)){
                inMap.set(connection.in, new Array<number>());
            }

            inMap.get(connection.in)?.push(connection.out);
        }

        while(inputIds.length) {
            const node_id: number = inputIds.pop()!;
            
            const node: Node = this.nodes.get(node_id)!;

            const currentLayer: number = node.layerNumber;

            for(const outNodeId of inMap.get(node.id) || []) {
                const outNode: Node | undefined = this.nodes.get(outNodeId);
                if(outNode === undefined) continue;
                outNode!.layerNumber = Math.max(currentLayer + 1, outNode?.layerNumber!);

                inputIds.unshift(outNode.id);
            }
        }
    }

    // DONE
    private getRandomEnabledConnection(): Connection {
        const enabledConnections: Array<Connection> = this.connections.filter((connection: Connection) => connection.enabled);
        return enabledConnections[(Math.random() * enabledConnections.length) >> 0];
    }

    // private pushFollowingNodes(node_id: number): void {
    //     // ID
    //     const nodeList: Array<number> = 
    //         this.connections.filter((connection: Connection) => connection.in === node_id).map((connection: Connection) => connection.out);
    //     
    //     for(const node of nodeList) {
    //         this.pushFollowingNodes(node);
    //         this.nodes.get(node)!.layerNumber++;
    //     }
    // }

    // DONE
    private addNodeMutation() {
        const randConnection = this.getRandomEnabledConnection();
        
        const node: Node = {
            id: this._node_count,
            type: 'HIDDEN',
            valueAfterActivation: 0,
            valueBeforeActivation: 0,
            activation: Sigmoid,
            layerNumber: 0
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

        if(rnd < 0) {
            console.log('CONNECTION MUTATION');
            this.addConnectionMutation();
        }else if(rnd < 1) {
            console.log('NODE MUTATION');
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
       
        const sortedNodes: Array<Node> = Array.from(this.nodes.values()).sort((a: Node, b: Node) => {
            return a.layerNumber - b.layerNumber;
        });

        for(let i = 0; i < this.inputNodes.length; ++i) {
            this.inputNodes[i].valueAfterActivation = inputs[i];
        }

        for(const _ of sortedNodes) {
            // if(!connection.enabled) continue;

            // if(!this.nodes.has(connection.in))
            //     throw new Error(`Node with id ${connection.in} does not exist while a connection from that node exist`);

            // if(!this.nodes.has(connection.out))
            //     throw new Error(`Node with id ${connection.out} does not exist while a connection into that node exist`);

            // const inNode: Node = this.nodes.get(connection.in)!;
            // const outNode: Node = this.nodes.get(connection.out)!;
            // 
        }

        return output;
    }


    getNodesByLayer(): NodeByLayerOutput {
        const nodes: Array<Node> = Array.from(this.nodes.values());
        const layerMap: Map<number, Array<Node>> = new Map<number, Array<Node>>();
        let maxLayerNumber: number = 0;

        for(const node of nodes) {
            if(!layerMap.has(node.layerNumber)) {
                layerMap.set(node.layerNumber, new Array<Node>());
            }
            layerMap.get(node.layerNumber)!.push(node);

            if(node.layerNumber > maxLayerNumber) maxLayerNumber = node.layerNumber;
        }

        return {
            maxLayerNumber,
            layerMap
        };
    }


    printNetwork(): void {
        const {layerMap, maxLayerNumber} = this.getNodesByLayer();

        for(let i=0; i<maxLayerNumber+1; ++i) {
            const nodesInLayer: Array<Node> = layerMap.get(i)!;

            console.log('ID | LAYER');
            for(const node of nodesInLayer) {
                console.log(node.id, i);
            }

        }
    }


    getConnection(innov: number): Connection | undefined {
        return this.connectionsLUT.get(innov);
    }

    getConnections(): Array<Connection> {
        return this.connections;
    }
}


