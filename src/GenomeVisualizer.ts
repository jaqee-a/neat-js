import { Genome } from "./Genome";



interface CanvasOptions {
    width: number;
    height: number;
}


export class GenomeVisualizer {
    private canvasOptions: CanvasOptions;
    private ctx: CanvasRenderingContext2D;

    constructor(private canvas: HTMLCanvasElement) {
        this.canvasOptions = {
            width: this.canvas.width,
            height: this.canvas.height,
        }
        this.ctx = this.canvas.getContext('2d')!;
    }



    drawGenome(genome: Genome) {
        const { maxLayerNumber,
                layerMap } = genome.getNodesByLayer()

        const columnSize = this.canvasOptions.width / maxLayerNumber;

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvasOptions.width, this.canvasOptions.height);

        this.ctx.fillStyle = '#fff';
        for(let i=0; i<maxLayerNumber; ++i) {
            const nodes = layerMap.get(i)!;
            const rowSize = this.canvas.height / nodes.length;

            for(let j = 0; j < nodes.length; ++i) {
                this.ctx.fillRect(i * columnSize, j * rowSize, columnSize, rowSize);
            }
        }
    }
}
