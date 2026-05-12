//Denne klasse er en implementation af et "spacial grid"
//Dette dividere canvas i mindre celler, og holder styr på hvilke fisk der er i hvilke celler
//Dette gør det mere effektivt for hver fisk at tjekke for hinanden når de schooler, da de kun behøver at tjekke de celler der er i nærheden, i stedet for hele canvaset
class Cell {
    constructor() {
        this.boids = [];
    }
    
    addFish(fish) {
        this.boids.push(fish);
    }

    clear() {
        this.boids = [];
    }
}

class SpacialGrid {
    constructor(canvasWidth, canvasHeight, cellSize) {
        this.cellSize = cellSize;
        this.columns = Math.ceil(canvasWidth / cellSize);
        this.rows = Math.ceil(canvasHeight / cellSize);

        // 2d array til gridet, hvor hver celle indeholder en liste af fisk
        this.grid = [];
        for (let i = 0; i < this.rows; i++) {
            this.grid.push([]);            //for hver række, lav et nyt tomt array
            for (let j = 0; j < this.columns; j++) {
                this.grid[i].push(new Cell());  //for hver kolonne i rækken, lav en ny celle til fisk
            }
        }
    }
    

    clear() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.grid[i][j].clear(); //tøm hver celle for fisk
            }
        }
    }

    addBoid(fish) {
        let col = Math.floor(fish.position.x / this.cellSize); //find kolonnen baseret på fiskens x position
        let row = Math.floor(fish.position.y / this.cellSize); //find rækken baseret på fiskens y position

        // Sørg for at kolonne og række er inden for grænserne af gridet
        if (col >= 0 && col < this.columns && row >= 0 && row < this.rows) {
            this.grid[row][col].addFish(fish); //tilføj fisken til den korrekte celle
        }
    }

    getNeighbors(fish) {
        let neighbors = [];
        let col = Math.floor(fish.position.x / this.cellSize);
        let row = Math.floor(fish.position.y / this.cellSize);

        // Tjek de omkringliggende celler (inklusive den nuværende celle)
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                // Beregner den nye kolonne og række med modulo for at håndtere wrap-around
                let newCol = (col + dx + this.columns) % this.columns;
                let newRow = (row + dy + this.rows) % this.rows;
                
                // Tilføj alle fisk i den nye celle til naboerne
                neighbors.push(...this.grid[newRow][newCol].boids);
            }
        }
        
        return neighbors; // returnere alle boids i de 9 celler (den nuværende og de 8 omkringliggende) som naboer
    }
    
}