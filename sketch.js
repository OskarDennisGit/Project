let width = 1500;
let height = 1000;
let initialFishAmount = 100;
let fishes;
let predators; //
let food;

//-------------------------------------------SETUP--------------------------------------------------

function setup() {
    createCanvas(width, height);
    fishes = new Fishes(initialFishAmount);

    food = [];
    predators = [];

    //laver 2 rovfisk med position, størrelse og fangstradius (meget lille radius)
    predators.push(new Predator(300, 300, 6, 8));
    predators.push(new Predator(1100, 700, 6, 8));
    
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
            fishes.fishArray.splice(i, 1);
        }
    }

    fishes.eatFood(food);
    fishes.spawn();
    fishes.displayHunger();

    // opdater alle rovfisk (jager og fanger fisk)
    for (let i = predators.length - 1; i >= 0; i--) {
        predators[i].hunt(fishes.fishArray);
        predators[i].separateFromPredators(predators);
        predators[i].move();
        predators[i].moveToStart();
        predators[i].catchFish(fishes.fishArray);
        predators[i].loseHunger();
        predators[i].spawn();
        predators[i].draw();

        // fjern rovfisken hvis den er sultet ihjel
        if (predators[i].hunger <= 0) {
            predators.splice(i, 1);
        }
    }

    fishes.draw();

    if (random(1) < 0.02) { // tilfældigt respawn af maden (1% chance hver frame)
        food.push(new Mad());
    }
    
    for (let i = 0; i < food.length; i++) {
        food[i].drawFood();
        food[i].grow();
    }
}

