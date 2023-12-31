"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Genome = void 0;
const Innov_1 = require("./Innov");
const ReLU = (x) => { return (x > 0 ? 1 : 0) * x; };
class Genome {
    constructor(inputCount, outputCount, initialize = true) {
        Object.defineProperty(this, "inputCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: inputCount
        });
        Object.defineProperty(this, "outputCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: outputCount
        });
        Object.defineProperty(this, "nodes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "connectionsLUT", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "connections", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "inputNodes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_node_count", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.nodes = new Map();
        this.connectionsLUT = new Map();
        this.connections = new Array();
        this._node_count = 0;
        if (initialize) {
            this.inputNodes = new Array(this.inputCount);
            this.createInitialNodes();
        }
        else {
            this.inputNodes = new Array();
        }
    }
    createInitialNodes() {
        for (let i = 0; i < this.inputCount; ++i) {
            const node = {
                id: i,
                type: 'INPUT',
                activation: ReLU,
                layerNumber: 0
            };
            for (let j = 0; j < this.outputCount; ++j) {
                const connection = {
                    in: i,
                    out: this.inputCount + j,
                    weight: Math.random(),
                    enabled: true,
                    innov: -((this.outputCount * i) + j + 1)
                };
                this.addConnection(connection);
            }
            this.nodes.set(i, node);
            this.inputNodes[i] = node;
        }
        for (let i = 0; i < this.outputCount; ++i) {
            const node = {
                id: this.inputCount + i,
                type: 'OUTPUT',
                activation: ReLU,
                layerNumber: 1
            };
            this.nodes.set(this.inputCount + i, node);
        }
        this._node_count = this.inputCount + this.outputCount;
    }
    getUnconnectedNodes() {
        const nodes = Array.from(this.nodes.values());
        const node1 = nodes[(Math.random() * nodes.length) << 0].id;
        let MAX_ITER = 10;
        let node2;
        do {
            node2 = nodes[(Math.random() * nodes.length) << 0].id;
        } while (node1 === node2 && MAX_ITER--);
        return [node1, node2];
    }
    addConnectionMutation() {
        let [node1, node2] = this.getUnconnectedNodes();
        if (this.nodes.get(node2).layerNumber < this.nodes.get(node1).layerNumber) {
            let tmp = node1;
            node1 = node2;
            node2 = tmp;
        }
        const _similarConnections = this.connections.filter((connection) => connection.in == node1 && connection.out == node2).length;
        if (_similarConnections > 0)
            return;
        const newConnection = {
            innov: Innov_1.InnovationFactory.GenNewInnovationNumber(),
            weight: Math.random(),
            enabled: true,
            in: node1,
            out: node2
        };
        this.addConnection(newConnection);
    }
    constructTopologicalNetwork2() {
        const calculateNode = (node, layerIndex) => {
            const node_id = node.id;
            node.layerNumber = Math.min(layerIndex, node.layerNumber);
            let incommingConnections = this.connections.filter((connection) => node_id === connection.out);
            console.log(node_id);
            for (const connection of incommingConnections) {
                calculateNode(this.nodes.get(connection.in), layerIndex + 1);
            }
        };
        Array.from(this.nodes.values())
            .filter((node) => node.type === 'OUTPUT')
            .forEach((node) => calculateNode(node, 0));
    }
    constructTopologicalNetwork() {
        var _a;
        const inputIds = this.inputNodes.map((node) => node.id);
        const inMap = new Map();
        for (const connection of this.connections) {
            if (!inMap.has(connection.in)) {
                inMap.set(connection.in, new Array());
            }
            (_a = inMap.get(connection.in)) === null || _a === void 0 ? void 0 : _a.push(connection.out);
        }
        while (inputIds.length) {
            const node_id = inputIds.pop();
            const node = this.nodes.get(node_id);
            const currentLayer = node.layerNumber;
            for (const outNodeId of inMap.get(node.id) || []) {
                const outNode = this.nodes.get(outNodeId);
                if (outNode === undefined)
                    continue;
                outNode.layerNumber = Math.max(currentLayer + 1, outNode === null || outNode === void 0 ? void 0 : outNode.layerNumber);
                inputIds.unshift(outNode.id);
            }
        }
    }
    getRandomEnabledConnection() {
        const enabledConnections = this.connections.filter((connection) => connection.enabled);
        return enabledConnections[(Math.random() * enabledConnections.length) >> 0];
    }
    addNodeMutation() {
        const randConnection = this.getRandomEnabledConnection();
        const node = {
            id: this._node_count,
            type: 'HIDDEN',
            activation: ReLU,
            layerNumber: 0
        };
        const conn1 = {
            in: randConnection.in,
            out: node.id,
            enabled: true,
            weight: 1,
            innov: Innov_1.InnovationFactory.GenNewInnovationNumber()
        };
        const conn2 = {
            in: node.id,
            out: randConnection.out,
            enabled: true,
            weight: Math.random(),
            innov: Innov_1.InnovationFactory.GenNewInnovationNumber()
        };
        randConnection.enabled = false;
        this.addConnection(conn1);
        this.addConnection(conn2);
        this.addNode(node);
    }
    addNode(node) {
        if (this.nodes.has(node.id)) {
            throw new Error('Node already exist in the genome');
        }
        this.nodes.set(node.id, node);
        if (node.type === 'INPUT') {
            this.inputNodes.push(node);
            ++this.inputCount;
        }
        ++this._node_count;
    }
    addConnection(connection) {
        this.connections.push(connection);
        this.connectionsLUT.set(connection.innov, connection);
    }
    mutate(mutation_chance = 0.3) {
        const rnd = Math.random();
        if (rnd < mutation_chance) {
            if (rnd < mutation_chance / 2) {
                console.log('CONNECTION MUTATION');
                this.addConnectionMutation();
            }
            else {
                console.log('NODE MUTATION');
                this.addNodeMutation();
            }
        }
    }
    crossover(parent2) {
        const child = this.clone();
        const parent2Connections = parent2.getConnections();
        for (const parent2Connection of parent2Connections) {
            if (this.connectionsLUT.has(parent2Connection.innov)) {
                const connection = child.getConnection(parent2Connection.innov);
                connection.enabled = parent2Connection.enabled && connection.enabled;
                continue;
            }
            child.addConnection(parent2Connection);
        }
        return child;
    }
    clone() {
        const genome = new Genome(this.inputCount, this.outputCount, false);
        this.connections.forEach((connection) => genome.addConnection(Object.assign({}, connection)));
        this.nodes.forEach((node) => genome.addNode(Object.assign({}, node)));
        return genome;
    }
    calculateOutput(inputs) {
        if (inputs.length !== this.inputNodes.length)
            throw new Error("Input vector length does not match input nodes count");
        const calculatedNodes = new Map();
        for (let i = 0; i < this.inputNodes.length; ++i) {
            calculatedNodes.set(this.inputNodes[i].id, inputs[i]);
        }
        const calculateNode = (node) => {
            const node_id = node.id;
            if (calculatedNodes.has(node_id))
                return calculatedNodes.get(node_id);
            let incommingConnections = this.connections.filter((connection) => node_id === connection.out);
            let total = 0;
            for (const connection of incommingConnections) {
                if (!connection.enabled)
                    continue;
                total += calculateNode(this.nodes.get(connection.in)) * connection.weight;
            }
            const activatedTotal = node.activation(total);
            calculatedNodes.set(node_id, activatedTotal);
            return activatedTotal;
        };
        return Array.from(this.nodes.values()).filter((node) => node.type === 'OUTPUT').map((node) => calculateNode(node));
    }
    getNodesByLayer() {
        const nodes = Array.from(this.nodes.values());
        const layerMap = new Map();
        let maxLayerNumber = 0;
        for (const node of nodes) {
            if (!layerMap.has(node.layerNumber)) {
                layerMap.set(node.layerNumber, new Array());
            }
            layerMap.get(node.layerNumber).push(node);
            if (node.layerNumber > maxLayerNumber)
                maxLayerNumber = node.layerNumber;
        }
        return {
            maxLayerNumber,
            layerMap
        };
    }
    printNetwork() {
        const { layerMap, maxLayerNumber } = this.getNodesByLayer();
        for (let i = 0; i < maxLayerNumber + 1; ++i) {
            const nodesInLayer = layerMap.get(i);
            console.log('ID | LAYER');
            for (const node of nodesInLayer) {
                console.log(node.id, i);
            }
        }
    }
    getConnection(innov) {
        return this.connectionsLUT.get(innov);
    }
    getConnections() {
        return this.connections;
    }
}
exports.Genome = Genome;
