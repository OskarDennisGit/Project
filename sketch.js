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

    fishes.eatFood(food);
    //spiser og formerer sig (spisefunktion skal arbejdes mere på lige pt er den bare random)
    fishes.spawn();
    fishes.displayHunger();
    


    // opdater alle rovfisk (jager og fanger fisk)
    for (let i = 0; i < predators.length; i++) {
        predators[i].hunt(fishes.fishArray);   // find nærmeste fisk og brug seek
        predators[i].move();                   // arvet fra Fish – opdater position
        predators[i].moveToStart();            // wrapper rundt (samme som almindelige fisk)
        predators[i].catchFish(fishes.fishArray);
        predators[i].draw();
        predators[i].spawn();   // spawn nye rovfisk hvis nok fisk er fanget
    }

    fishes.draw();

    if (random(1) < 0.02) { // tilfældigt respawn af maden (1% chance hver frame)
        food.push(new Mad());
    }
    
    for (let i = 0; i < food.length; i++) {
        food[i].drawFood();
        food[i].grow(); // maden vokser over tid
    }

    console.log("Antal fisk: " + fishes.fishArray.length);
}


