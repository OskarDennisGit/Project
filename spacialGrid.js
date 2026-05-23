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
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.columns = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);

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
        } else {
            console.warn("Fish position out of bounds for grid: ", fish.position);
        }
    }

    getNeighbors(fish) {
        let neighbors = [];
        let thisCol = Math.floor(fish.position.x / this.cellSize);
        let thisRow = Math.floor(fish.position.y / this.cellSize);

        // Tjek de omkringliggende celler (inklusiv den nuværende celle)
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                // Beregner den nye kolonne og række til at håndtere wrap-around
                let newCol = (thisCol + dx + this.columns) % this.columns;
                let newRow = (thisRow + dy + this.rows) % this.rows;
                
                // Tilføj alle fisk i den nye celle til naboerne
                neighbors.push(...this.grid[newRow][newCol].boids);
            }
        }
        
        return neighbors; // returnere alle boids i de 9 celler (den nuværende og de 8 omkringliggende) som naboer
    }
    
}
// For at kunne importere SpacialGrid-klassen i unit-test
if (typeof module !== 'undefined') {
    module.exports = { SpacialGrid, Cell };
}