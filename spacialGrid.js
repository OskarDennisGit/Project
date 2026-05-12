//Denne klasse er en implementation af et "spacial grid"
//Dette dividere canvas i mindre celler, og holder styr på hvilke fisk der er i hvilke celler
//Dette gør det mere effektivt for hver fisk at tjekke for hinanden når de schooler, da de kun behøver at tjekke de celler der er i nærheden, i stedet for hele canvaset
class SpacialGrid {
    constructor(canvasWidth, canvasHeight, cellSize) {
        this.cellSize = cellSize;
        this.columns = Math.ceil(canvasWidth / cellSize);
        this.rows = Math.ceil(canvasHeight / cellSize);
    }
    
    //laver et grid der gør brug af et array af maps
}