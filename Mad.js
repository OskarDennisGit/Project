class Mad {

    constructor(x, y) {
        // hvis ingen position gives, placer tilfældigt, ellers brug den givne position
        this.position = createVector(x || random(width), y || random(height));
        this.size = random(5, 15); // størrelse på maden
    }

    drawFood() {
        fill(0, 255, 50, 75); // farve for maden
        noStroke();
        circle(this.position.x, this.position.y, this.size); // tegner maden som en cirkel
    }

    grow() {
        this.size += 0.1; // maden vokser over tid
    }
}