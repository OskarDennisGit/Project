//--------------------------------------------BOIDFISH CLASS------------------------------
// Planteædende flokfisk arver det basale fra Animal og tilføjer flok-adfærd

class BoidFish extends Animal {

    constructor(xpos, ypos, size) {
        super(xpos, ypos, size); // nedarv position, velocity, acceleration mv. fra Animal
        //creating allignment force (fra original Fish)
        this.allignmentForce = createVector(0, 0);
    }

    // tegner fisken som en orange trekant der peger i bevægelsesretningen
    // tyvstjålet fra https://p5js.org/examples/classes-and-objects-flocking/
    // tegner trekanter baseret på deres position og retning, så de ser ud som om de svømmer i den retning de peger.
    drawAlive() {
        let theta = this.velocity.heading() + radians(90);
        fill("orange");
        stroke(255);
        push();
            translate(this.position.x, this.position.y);
            rotate(theta);
            // body — oblong diamond shape
            beginShape();
                vertex(0, -this.size * 3);    // nose
                vertex(-this.size, 0);         // left middle
                vertex(0, this.size * 2);      // back of body
                vertex(this.size, 0);          // right middle
            endShape(CLOSE);
            // tail — triangle below body
            beginShape();
                vertex(0, this.size * 2);      // top of tail (connects to body)
                vertex(-this.size * 1.5, this.size * 4); // left tip of tail
                vertex(this.size * 1.5, this.size * 4);  // right tip of tail
            endShape(CLOSE);
        pop();
    }

    // kombinerer alignment, cohesion og separation for flok-adfærd
    school(boids) {
        //alligment
        let allignment = this.allign(boids);
        allignment.mult(0.7); // justerer styrken af allignment kraften
        this.acceleration.add(allignment);

        //cohesion
        let cohesion = this.cohere(boids);
        cohesion.mult(0.1); // justerer styrken af cohesion kraften
        this.acceleration.add(cohesion);

        let seperation = this.seperate(boids);
        seperation.mult(1.5);
        this.acceleration.add(seperation);
    }

    // almindelig fisk mister 0.5 hunger i sekundet hvis den rammer 0 dør den i draw() løkken
    // (override af Animal's loseHunger)
    loseHunger() {
        if (random(1) < 0.50) { // tilfældigt tab af hunger (50% chance hver frame)
            this.hunger -= 0.5 / 60; // mister 0.5 hunger i sekundet (justeret for 60 FPS) (i gennemsnit mister den 0.25 hunger i sekundet)
            if (this.hunger < 0) this.hunger = 0;
        }
    }

    // For hver fisk tæt på, beregner vi den gennemsnitlige hastighed af de andre fisk og justerer vores hastighed for at matche den gennemsnitlige hastighed.
    allign(boids) {
        let distanceThreshold = 50;
        let totalForce = createVector();
        let count = 0;

        // for hver boid i arrayet, hvis den er inden for distanceThreshold, tilføj dens hastighed til total og øg count.
        for (let i = 0; i < boids.length; i++) {
            operationCounter++; // tæller operationer 
            if (boids[i].dead) continue; // ignorer døde fisk
            let d = p5.Vector.dist(this.position, boids[i].position);
            if (d > 0 && d < distanceThreshold) {
                totalForce.add(boids[i].velocity);
                count++;
            }
        }
        // Hvis der er nogen boids inden for distanceThreshold, beregn den gennemsnitlige hastighed og juster denne fisks
        // hastighed for at matche den.
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

    // for hver fisk tæt på beregner vi den gennemsnitlige position af de andre fisk
    // og justerer denne hastighed for at bevæge os mod den gennemsnitlige position. (midten)
    cohere(boids) {
        let distanceThreshold = 50;
        let sumPosition = createVector(0, 0);
        let count = 0;

        // for hver fisk tjek om den er tæt på. Hvis den er, tilføj dens position til totalen.
        for (let i = 0; i < boids.length; i++) {
            operationCounter++; //tæller operationer
            if (boids[i].dead) continue; // ignorer døde fisk
            let d = p5.Vector.dist(this.position, boids[i].position);
            if (d > 0 && d < distanceThreshold) {
                sumPosition.add(boids[i].position);
                count++;
            }
        }
        // Hvis der er nogen boids inden for distanceThreshold, beregn den gennemsnitlige position og juster denne fisks
        if (count > 0) {
            sumPosition.div(count);
            return this.seek(sumPosition); // seek arves fra Animal
        } else { // ellers tom vector så den forbliver uændret
            return createVector(0, 0);
        }
    }

    // tjekker for fisk tæt på og bevæger sig væk
    seperate(boids) {
        let desiredSeparation = 25;
        let total = createVector(0, 0);
        let count = 0;

        // for hver fisk tjek distancen til andre
        for (let i = 0; i < boids.length; i++) {
            operationCounter++; //tæller operationer
            if (boids[i].dead) continue; // ignorer døde fisk
            let d = p5.Vector.dist(this.position, boids[i].position);
            
            // hvis den er over nul og under desiredSeparation,
            // beregn en vektor væk fra den anden fisk, vægtet af hvor tæt den er.
            if (d > 0 && d < desiredSeparation) {
                // lav en vektor fra den anden fisk til denne fisk
                let difference = p5.Vector.sub(this.position, boids[i].position);
                difference.normalize();
                // jo tættere den anden fisk er, jo stærkere skal denne separere
                difference.div(d);
                total.add(difference);
                count++;
            }
        }
        
        // hvis der er nogen boids inden for desiredSeparation, beregn den gennemsnitlige separation og juster denne fisks hastighed for at bevæge sig væk.
        if (count > 0) {
            total.div(count);
        }

        let steering = createVector(0, 0);
        // hvis total er større end 0, normaliser den og gang med maxSpeed for at få den ønskede hastighed i retning væk fra de andre fisk.
        if (total.mag() > 0) {
            total.normalize();
            total.mult(this.maxSpeed);
            steering = p5.Vector.sub(total, this.velocity);
            steering.limit(this.maxSteeringForce);
        }
        return steering;
    }

    // returnerer true hvis fisken har spist nok til at formere sig
    canSpawn() {
        return this.hunger > 8;
    }

    // søger mod den nærmeste madkilde
    seekFood(foodArray) {
        if (foodArray.length === 0) return;

        // nærmeste mad søges ved at løbe gennem foodArray og finde den med den korteste distance til denne fisk.
        // denne funktion er ens med hunt() i Predator bare kigger igennem madarrayet i stedet for fiskene.
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
            let steering = this.seek(closest.position); // seek arves fra Animal
            steering.mult(2.5); // justerer styrken af søge kraften mod maden
            this.acceleration.add(steering);
        }
    }
}

//------------------------------BOIDFISHES CONTAINER CLASS------------------------------
// Håndterer alle BoidFish objekter samlet

class BoidFishes {

    fishArray = [];

    constructor(amount) {
        for (let i = 0; i < amount; i++) {
            let xpos = random(0, width);
            let ypos = random(0, height);
            this.fishArray.push(new BoidFish(xpos, ypos, 3));
        }
        // spacial grid til at optimere schooling
        this.spacialGrid = new SpacialGrid(50); // opretter et spacial grid for at optimere schoolingen
    }

    draw() {
        for (let fish of this.fishArray) {
            fish.draw();
        }
    }

    move(food) {
        // opdater spacial grid med alle fisks positioner
        this.spacialGrid.clear();
        for (let fish of this.fishArray) {  
            this.spacialGrid.addBoid(fish); // tilføjer hver fisk til spacial gridet baseret på dens position
        }

       for (let fish of this.fishArray) {
            if (fish.dead) continue; // døde fisk bevæger sig ikke
            let neighbors = this.spacialGrid.getNeighbors(fish);
            //let neighbors = this.fishArray; // hvis vi ikke bruger spacial grid, så er alle fisk naboer
            fish.seekFood(food);
            fish.school(neighbors);
            fish.move(); // arvet fra Animal
            fish.loseHunger();
        }
    }

    // teleporter fisk til modsatte side af canvasset (wrap-around)
    // move fish to the opposite side of the canvas when they go off the edge
    moveToStart() {
        for (let fish of this.fishArray) {
            fish.moveToStart(); // arvet fra Animal
        }
    }

    // hvis en fisk har mad nok, kan den formere sig og lave en ny fisk.
    spawn() {
        for (let i = 0; i < this.fishArray.length; i++) {
            if (this.fishArray[i].canSpawn()) {
                let xpos = this.fishArray[i].position.x + random(-10, 10);
                let ypos = this.fishArray[i].position.y + random(-10, 10);
                this.fishArray.push(new BoidFish(xpos, ypos, 3));
                this.fishArray[i].hunger = 4; // reset hunger after spawning
            }
        }
    }

    // lader fisk spise mad og øger hunger
    eatFood(foodArray) {
        for (let i = foodArray.length - 1; i >= 0; i--) {
            let foodItem = foodArray[i];
            for (let j = this.fishArray.length - 1; j >= 0; j--) {
                let fish = this.fishArray[j];
                if (fish.dead) continue; // døde fisk spiser ikke
                let dx = fish.position.x - foodItem.position.x;
                let dy = fish.position.y - foodItem.position.y;
                
                let d = Math.sqrt(dx * dx + dy * dy);
                if (d < fish.size / 2 + foodItem.size / 2) {
                    fish.hunger++;
                    foodItem.size -= 0.5;
                }
            }
            if (foodItem.size <= 0) foodArray.splice(i, 1);
        }
    }

    // viser hunger over hver levende fisk
    displayHunger() {
        for (let fish of this.fishArray) {
            if (fish.dead) continue; // vis ikke hunger for døde fisk
            noStroke();
            fill(255);
            textSize(12);
            text(floor(fish.hunger), fish.position.x + 10, fish.position.y - 10); // viser hunger over fisken
        }
    }
}