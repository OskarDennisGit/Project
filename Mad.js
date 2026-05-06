let foodX;
let foodY;

class Mad {

    setup() {
        // Placer maden tilfældigt på lærredet
        foodX = random(width);
        foodY = random(height);
    }

    function drawFood() {
        fill("lime"); // farve for maden
        noStroke();
        circkle(foodX, foodY, 10, 10); // tegner maden som en cirkel

}
}
