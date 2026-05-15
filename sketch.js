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
    predators = [];
    feeders = []; // ændret fra scavengers

    //Initial 2 rovfisk med position, størrelse og fangstradius (meget lille radius)
    predators.push(new PredatorFish(300, 300, 6, 8)); // ændret fra Predator
    predators.push(new PredatorFish(1100, 700, 6, 8));


    // Initial 4 ådselædere med position og størrelsee
    feeders.push(new Feeder(400, 400, 4)); 
    feeders.push(new Feeder(800, 600, 4));
    feeders.push(new Feeder(1200, 200, 4));
    feeders.push(new Feeder(200, 800, 4));

    
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
for (let i = feeders.length - 1; i >= 0; i--) { // 
    let feeder = feeders[i];
    if (!feeder.dead) {
        feeder.seekCorpse(fishes.fishArray, predators, feeders);
        feeder.separate(feeders);
        feeder.move();
        feeder.moveToStart();
        feeder.eatCorpse(fishes.fishArray, predators, feeders);
        feeder.loseHunger();
        feeder.spawn(feeders);

        if (feeder.hunger <= 0) {
            feeder.dead = true;
        }
        
    }
    feeder.draw();
    

}

    // opdater alle rovfisk (jager og fanger fisk)
for (let i = predators.length - 1; i >= 0; i--) {
    if (!predators[i].dead) {
        predators[i].hunt(fishes.fishArray);
        predators[i].separateFromPredators(predators);
        predators[i].move();
        predators[i].moveToStart();
        predators[i].catchFish(fishes.fishArray);
        predators[i].loseHunger();
        predators[i].spawn();

        if (predators[i].hunger <= 0) {
            predators[i].dead = true;
        }
    }

    // fjern rovfisken fra arrayet hvis den er spist af en scavenger
    if (predators[i].eaten) {
        predators.splice(i, 1);
        continue;
    }

    predators[i].draw();
}

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