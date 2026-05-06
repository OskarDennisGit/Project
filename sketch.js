let width = 1500;
let height = 1000;
let initialFishAmount = 100;
let fishes;
let predators; //


//-------------------------------------------SETUP--------------------------------------------------

function setup() {
    createCanvas(width, height);
    fishes = new Fishes(initialFishAmount);

    
    predators = [];

    //laver 2 rovfisk med position, størrelse og fangstradius (meget lille radius)
    predators.push(new Predator(300, 300, 6, 8));
    predators.push(new Predator(1100, 700, 6, 8));
}

//-------------------------------------------DRAW--------------------------------------------------
function draw() {
    background(20, 100, 200);
    fishes.move();
    fishes.moveToStart();
    fishes.spawn();

    // opdater alle rovfisk (jager og fanger fisk)
    for (let i = 0; i < predators.length; i++) {
        predators[i].hunt(fishes.fishArray);   // find nærmeste fisk og brug seek
        predators[i].move();                   // arvet fra Fish – opdater position
        predators[i].moveToStart();            // wrapper rundt (samme som almindelige fisk)
        predators[i].catchFish(fishes.fishArray);
        predators[i].draw();
    }

    fishes.draw();
}


