//--------------------------------------------FISH CLASS ------------------------------

class Fish {

    constructor(xpos, ypos, size) {
        this.position = createVector(xpos, ypos);
        this.size = size;
        
        //random vector velocity så de starter i forskellige retninger
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        this.acceleration = createVector(0, 0);
        this.direction = this.velocity.heading();

        this.maxSpeed = 3;
        this.maxSteeringForce = 1.2;

        this.hunger = 5;
        this.dead = false;

        //creating allignment force
        this.allignmentForce = createVector(0, 0);
    }

    draw() {
    
    //tyvstjålet fra https://p5js.org/examples/classes-and-objects-flocking/ 
    //tegner trekanter baseret på deres position og retning, så de ser ud som om de svømmer i den retning de peger.
    let theta = this.velocity.heading() + radians(90);
   if (this.dead) {
    fill(150);
    noStroke();
    circle(this.position.x, this.position.y, this.size * 2);
    return; // tegn ikke trekanten
} else {
        fill("orange");
    }
    stroke(255);
    push();
        translate(this.position.x, this.position.y);
        rotate(theta);
        beginShape();
            vertex(0, -this.size * 2);
            vertex(-this.size, this.size * 2);
            vertex(this.size, this.size * 2);
        endShape(CLOSE);
    pop();
}


    move() {
      //flytter fiskene fremad baseret på deres retning of hastighed
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
    }

    school(boids) { 
        //alligment
        let allignment = this.allign(boids);
        allignment.mult(0.7); //justerer styrken af allignment kraften
        this.acceleration.add(allignment);

        //cohesion
        let cohesion = this.cohere(boids);
        cohesion.mult(0.1); //justerer styrken af cohesion kraften
        this.acceleration.add(cohesion);

        let seperation = this.seperate(boids);
        seperation.mult(1.5);
        this.acceleration.add(seperation);

    }
// almindelig fisk mister 0.5 hunger i sekundet hvis den rammer 0 dør den i draw() løkken
loseHunger() {
    if (random(1) < 0.50) { // tilfældigt tab af hunger (50% chance hver frame)
    this.hunger -= 0.5 / 60; // mister 0.5 hunger i sekundet (justeret for 60 FPS) (i gennemsnit mister den 0.25 hunger i sekundet)
    if (this.hunger < 0) this.hunger = 0;
    }
}

    //Søger efter en given target position og beregner en steering force for at bevæge sig mod den.
    seek(target) {

        //vector fra position til target
        let desired;
        desired = p5.Vector.sub(target, this.position);
        
        //normaliserer desired vectoren og ganger den med maxSpeed for at få den ønskede hastighed i retning af target.
        desired.normalize();
        desired.mult(this.maxSpeed);

        //steering force er ønsket hastighed minus den nuværende hastighed.
        let steering;
        steering = p5.Vector.sub(desired, this.velocity);
        steering.limit(this.maxSteeringForce); //begrænser styrken af steering force til maxSteeringForce
        return steering;
    }


    //For hver fisk tæt på, berægner vi den gennemsnitlige hastighed af de andre fisk og justerer vores hastighed for at matche den gennemsnitlige hastighed.
    allign(boids) {
        let distanceThreshold = 50;
        let totalForce = createVector();
        let count = 0;

        //for hver boid i arrayet, hvis den er inden for distanceThreshold, tilføj dens hastighed til total og øg count.
        for (let i = 0; i < boids.length; i++) {

            if (boids[i].dead) continue; // ignorer døde fisk
            let d = p5.Vector.dist(this.position, boids[i].position);
            if (d > 0 && d < distanceThreshold) {
                totalForce.add(boids[i].velocity);
                count++;
            }
        }
        //Hvis der er nogen boids inden for distanceThreshold, beregn den gennemsnitlige hastighed og juster denne fisks
        //  hastighed for at matche den.
        if (count > 0) {
            totalForce.div(count);
            totalForce.setMag(this.maxSpeed);
            let steering = p5.Vector.sub(totalForce, this.velocity);
            steering.limit(this.maxSteeringForce);
            return steering;
        } else {
            return createVector(0, 0);
        }
    }

    //for hver fisk tæt på beregner vi den gennemsnitlige position af de andre fisk
    //  og justerer denne hastighed for at bevæge os mod den gennemsnitlige position. (midten)
    cohere(boids) {
        let distanceThreshold = 50;
        let sumPosition = createVector(0,0);
        let count = 0;

        //for hver filk tjæk om den er tæt på. Hvis den er, tilføk dens position til totalen.
        for (let i = 0; i < boids.length; i++) {

            if (boids[i].dead) continue; // ignorer døde fisk
            let d = p5.Vector.dist(this.position, boids[i].position);
            if (d > 0 && d < distanceThreshold) {
                sumPosition.add(boids[i].position);
                count++;
            }
        }
        //Hvis der er nogen boids inden for distanceThreshold, beregn den gennemsnitlige position og juster denne fisks
        if (count > 0) {
            sumPosition.div(count);
            return this.seek(sumPosition);
        } else { //ellers tom vector så den forbliver uændret
            return createVector(0, 0);
        }   
    }


    //tjækker for fisk tæt på og bevæger sig væk
    seperate(boids) {
        let desiredSeparation = 15;
        let total = createVector(0, 0);
        let count = 0;

        //for hver fisk tjæk distancen. Til andre
        for (let i = 0; i < boids.length; i++) {

              if (boids[i].dead) continue; // ignorer døde fisk
            let d = p5.Vector.dist(this.position, boids[i].position);
            
            //hvis den er over nul of under desiredSeparation, 
            //beregn en vektor væk fra den anden fisk, vægtet af hvor tæt den er.
            if (d > 0 && d < desiredSeparation) {

                //lav en vektor fra den anden fisk til denne fisk
                let difference = p5.Vector.sub(this.position, boids[i].position);
                difference.normalize();

                //jo tættere den anden fisk er, jo stærkere skal denne seperere
                difference.div(d);
                total.add(difference);
                count++;
            }
        }
        
        //hvis der er nogen boids inden for desiredSeparation, beregn den gennemsnitlige seperation og juster denne fisks hastighed for at bevæge sig væk.
        if (count > 0) {
            total.div(count);
        }

        let steering = createVector(0, 0);
        //hvis total er større end 0, normaliser den og gang med maxSpeed for at få den ønskede hastighed i retning væk fra de andre fisk.
        if (total.mag() > 0) {
            total.normalize();
            total.mult(this.maxSpeed);
            steering = p5.Vector.sub(total, this.velocity);
            steering.limit(this.maxSteeringForce);
        }
        return steering;
        
    }

    canSpawn() {
        if (this.hunger > 8) {
            return true;
        } else {
            return false;
        }
    }

    seekFood(foodArray) {
        if (foodArray.length === 0) return;

        //nærmeste mad søges ved at løbe gennem foodArray og finde den med den korteste distance til denne fisk.
        //denne funktion er ens med hunt() i Predator bare kigger igennem madarrayet i stedet for fiskene.
        let closest = null;
        let closestDist = Infinity;

        for (let food of foodArray) {
            let d = p5.Vector.dist(this.position, food.position);
            if (d < closestDist) {
                closestDist = d;
                closest = food;
            }
        }

        if (closest != null) {
            let steering = this.seek(closest.position);
            steering.mult(2.5); //justerer styrken af søge kraften mod maden
            this.acceleration.add(steering);
        }
    }
    
} 

//------------------------------container class for all fishes----------------------
class Fishes {
    
    fishArray = [];

    constructor(amount) {
        for (let i = 0; i < amount; i++) {
            let xpos = random(0, width);
            let ypos = random(0, height);
            let size = 3;
            this.fishArray.push(new Fish(xpos, ypos, size));
        }
        this.spacialGrid = new SpacialGrid(width, height, 50); //opretter et spacial grid for at optimere schoolingen
    }

    draw() {        
        for (let i = 0; i < this.fishArray.length; i++) {
            this.fishArray[i].draw();
        }
    }

    move(food) {
    this.spacialGrid.clear();
    for (let fish of this.fishArray) {
        this.spacialGrid.addBoid(fish); // tilføjer hver fisk til spacial gridet baseret på dens position
    }

    for (let fish of this.fishArray) {
        if (fish.dead) continue; // døde fisk bevæger sig ikke
        let neighbors = this.spacialGrid.getNeighbors(fish);
        fish.seekFood(food);
        fish.school(neighbors);
        fish.move();
        fish.loseHunger();
    }
}

    //move fish to the opposite side of the canvas when they go off the edge
    moveToStart() {
        for (let i = 0; i < this.fishArray.length; i++) {
            if (this.fishArray[i].position.x > width + this.fishArray[i].size) {
                this.fishArray[i].position.x = 0 - this.fishArray[i].size;
            }
            if (this.fishArray[i].position.x < 0 - this.fishArray[i].size) {
                this.fishArray[i].position.x = width + this.fishArray[i].size;
            }
            if (this.fishArray[i].position.y > height + this.fishArray[i].size) {
                this.fishArray[i].position.y = 0 - this.fishArray[i].size;
            }
            if (this.fishArray[i].position.y < 0 - this.fishArray[i].size) {
                this.fishArray[i].position.y = height + this.fishArray[i].size;
            }
        }
    }

     //hvis en fisk har mad nok, kan den formere sig og lave en ny fisk.
    spawn() {
        for (let i = 0; i < this.fishArray.length; i++) {
            if (this.fishArray[i].canSpawn()) {
                let xpos = this.fishArray[i].position.x + random(-10, 10);
                let ypos = this.fishArray[i].position.y + random(-10, 10);
                let size = 3;
                this.fishArray.push(new Fish(xpos, ypos, size));
                this.fishArray[i].hunger = 4; //reset hunger after spawning
            }
        }
    }

    eatFood(foodArray) {
    for (let i = foodArray.length - 1; i >= 0; i--) {
        let foodItem = foodArray[i];
        for (let j = this.fishArray.length - 1; j >= 0; j--) {
            let fish = this.fishArray[j];
            let dx = fish.position.x - foodItem.position.x;
            let dy = fish.position.y - foodItem.position.y;
            let d = Math.sqrt(dx * dx + dy * dy);
            if (d < fish.size / 2 + foodItem.size / 2) {
                fish.hunger++;
                foodItem.size -= 0.5;
                console.log("EATING", d);
            }
        }
        if (foodItem.size <= 0) foodArray.splice(i, 1);
        }
    }

    displayHunger() {
        for (let i = 0; i < this.fishArray.length; i++) {
            let fish = this.fishArray[i];
                    if (fish.dead) continue; // vis ikke hunger for døde fisk

            noStroke();
            fill(255);
            textSize(12);
            text(floor(fish.hunger), fish.position.x + 10, fish.position.y - 10); //viser hunger over fisken
        }
    }

}

//------------------------------PREDATOR class (extender Fish)----------------------
class Predator extends Fish {
    constructor(x, y, size, catchRadius) {
        super(x, y, size);               // nedarv position, velocity, acceleration mv.
        this.maxSpeed = 3.5;            
        this.catchRadius = catchRadius;  
        this.hunger = 10;                 // starter med en vis hunger, så de ikke dør med det samme
    }

    // Finder den nærmeste fisk og bruger seek() 
    hunt(fishArray) {
        // Hvis der ingen fisk er tilbage, er der intet at jage
        if (fishArray.length === 0) return;

        let closest = null;
        let closestDist = Infinity; 

        // Løb alle fisk igennem og find den nærmeste
        for (let i = 0; i < fishArray.length; i++) {
            if (fishArray[i].dead) continue; // ignorer døde fisk
            let d = p5.Vector.dist(this.position, fishArray[i].position);
            if (d < closestDist) {
                closestDist = d;
                closest = fishArray[i];
            }
        }

         // closest kan være null hvis alle fisk er døde
    if (closest === null) return;

        //  seek() kaldes, den beregner en kraft der peger mod den nærmeste fisk og lægger den til accelerationen
        let steering = this.seek(closest.position);
        this.acceleration.add(steering); 
    }

    // Fanger fisk (meget lille radius, så fisken skal røres helt tæt på)
    catchFish(fishArray) {
    for (let i = fishArray.length - 1; i >= 0; i--) {
        let fish = fishArray[i];
        if (fish.dead) continue; // ignorer allerede døde fisk
        let d = p5.Vector.dist(this.position, fish.position);
        if (d < this.catchRadius) {
                fishArray.splice(i, 1);
                       this.hunger++;
        }
    }
}
    // seperate predators
    separateFromPredators(predatorArray) {
        let desiredSeparation = 80; // var 15 for fisk, meget større her
        let total = createVector(0, 0);
        let count = 0;

        for (let i = 0; i < predatorArray.length; i++) {

            if (predatorArray[i].dead) continue; // ignorer døde predators
            let d = p5.Vector.dist(this.position, predatorArray[i].position);
            if (d > 0 && d < desiredSeparation) {
                let difference = p5.Vector.sub(this.position, predatorArray[i].position);
                difference.normalize();
                difference.div(d);
                total.add(difference);
                count++;
            }
        }

        if (count > 0) {
            total.div(count);
            total.normalize();
            total.mult(this.maxSpeed);
            let steering = p5.Vector.sub(total, this.velocity);
            steering.limit(this.maxSteeringForce);
            this.acceleration.add(steering);
        }
    }

    // Wrap-around, præcis samme logik som Fishes.moveToStart (men kun for én fisk)
    moveToStart() {
        if (this.position.x > width + this.size) {
            this.position.x = 0 - this.size;
        }
        if (this.position.x < 0 - this.size) {
            this.position.x = width + this.size;
        }
        if (this.position.y > height + this.size) {
            this.position.y = 0 - this.size;
        }
        if (this.position.y < 0 - this.size) {
            this.position.y = height + this.size;
        }
    }

    // Tegner predator som en rød, lidt større trekant
  draw() {
    if (this.dead) {
        fill(150);
        noStroke();
        circle(this.position.x, this.position.y, this.size * 2);
        return;
    }

    let theta = this.velocity.heading() + radians(90);
    fill("red");
    stroke(255);
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    beginShape();
    vertex(0, -this.size * 3);
    vertex(-this.size * 1.5, this.size * 3);
    vertex(this.size * 1.5, this.size * 3);
    endShape(CLOSE);
    pop();

    // Viser fangstradius 
    noFill();
    stroke(255, 0, 0, 100);
    circle(this.position.x, this.position.y, this.catchRadius * 2);

    // Viser hunger
    noStroke();
    fill(255);
    textSize(14);
    text(floor(this.hunger), this.position.x + 15, this.position.y - 10);
}

    // predator mister 1 hunger i sekundet og hvis den rammer 0 dør den i draw() løkken
    loseHunger() {
        this.hunger -= 1 / 60;
        if (this.hunger < 0) this.hunger = 0;
    }

    // hvis rovfisken har hunger nok, kan den formere sig og lave en ny rovfisk
    spawn() {
        if (this.hunger > 40) {
            let xpos = this.position.x + random(-20, 20);
            let ypos = this.position.y + random(-20, 20);
            let size = 6;
            let catchRadius = 8;
            predators.push(new Predator(xpos, ypos, size, catchRadius));
            this.hunger = 4; // reset hunger efter spawning
        }
    }
}