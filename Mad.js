let foodX;
let foodY;

class Mad {

    constructor() {
        // Placer maden tilfældigt på lærredet
        this.foodX = random(width);
        this.foodY = random(height);
    }

    drawFood() {
        fill("lime"); // farve for maden
        noStroke();
        circle(this.foodX, this.foodY, 10, 10); // tegner maden som en cirkel

}
}
