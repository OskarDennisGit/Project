//let width = 1500;
//let height = 1000;
let initialFishAmount = 100;
let fishes;
let predators; //
let food;
let feeders; // ændret fra scavengers

//-------------------------------------------SETUP + initial kickstart-objects--------------------------------------------------

function setup() {
    frameRate(60);
    createCanvas(1500, 1000);
    fishes = new BoidFishes(initialFishAmount); // ændret fra Fishes

    food = [];
    predators = new Predators(0); // ændret fra tomt array
    feeders = new Feeders(0);     // ændret fra tomt array

    //Initial 2 rovfisk med position, størrelse og fangstradius (meget lille radius)
    predators.predatorArray.push(new PredatorFish(300, 300, 6, 8)); // ændret fra Predator
    predators.predatorArray.push(new PredatorFish(1100, 700, 6, 8));


    // Initial 4 ådselædere med position og størrelsee
    feeders.feederArray.push(new Feeder(400, 400, 4)); 
    feeders.feederArray.push(new Feeder(800, 600, 4));
    feeders.feederArray.push(new Feeder(1200, 200, 4));
    feeders.feederArray.push(new Feeder(200, 800, 4));

    
// Initial 15 døde fisk til scavengersne på tilfældige positioner og tilføjer dem til fiskearrayet som døde fisk
for (let i = 0; i < 15; i++) {
    let xpos = random(width);
    let ypos = random(height);
    let deadFish = new BoidFish(xpos, ypos, 3); // ændret fra Fish
    deadFish.dead = true; // gør fisken til et lig
    fishes.fishArray.push(deadFish);
}


    for (let i = 0; i < 6; i++) {
        food.push(new Mad());
    }
}

//-------------------------------------------DRAW--------------------------------------------------
function draw() {
    background(20, 100, 200);


    //add framerate display for debugging
    fill(255);
    textSize(16);
    text("FPS: " + floor(frameRate()), 10, 20);

    fishes.move(food);
    fishes.moveToStart();

    // fjern fisk der er sultede ihjel
   for (let i = fishes.fishArray.length - 1; i >= 0; i--) {
    if (fishes.fishArray[i].hunger <= 0) {
        fishes.fishArray[i].dead = true; // markér som død i stedet for at slette
    }
}

    fishes.eatFood(food);
    fishes.spawn();
    fishes.displayHunger();

    //tegn alle ådselædere og opdater deres adfærd (søge efter lig, spise lig, formere sig)
    feeders.move(fishes.fishArray, predators.predatorArray);
    feeders.draw();

    // opdater alle rovfisk (jager og fanger fisk)
    predators.move(fishes.fishArray);
    predators.draw();

    fishes.draw();

    /* random mad spawn er deaktiveret for at gøre det 100% afhængigt af scavengersne at holde maden i live
    
    if (random(1) < 0.02) { // tilfældigt respawn af maden (1% chance hver frame)
        food.push(new Mad()); 
    }
    */


    for (let i = 0; i < food.length; i++) {
        food[i].drawFood();
        food[i].grow();
    }

    //console.log("Antal fisk: " + fishes.fishArray.length);
}