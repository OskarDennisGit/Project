let foods = []; // array til at holde maden


class Mad {

    constructor() {
        // Placer maden tilfældigt på lærredet
        this.position = createvector(random(width), random(height));
    }

    drawFood() {
        fill("lime"); // farve for maden
        noStroke();
        circle(this.position.x, this.position.y, 10, 10); // tegner maden som en cirkel

    }
}
