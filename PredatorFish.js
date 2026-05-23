//------------------------------PREDATORFISH CLASS (extender Animal)----------------------

//til node.js testing, import Animal-klassen hvis den ikke allerede er defineret
if (typeof Animal === 'undefined') {
    global.Animal = require('./animal.js').Animal;
}

class PredatorFish extends Animal {
    constructor(x, y, size, catchRadius) {
        super(x, y, size);               // nedarv position, velocity, acceleration mv.
        this.maxSpeed = 3.5;            
        this.catchRadius = catchRadius;  
        this.hunger = 10;                 // starter med en vis hunger, så de ikke dør med det samme
        this.eaten = false;              // markeres som spist af ådselæder
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

        // seek() kaldes, den beregner en kraft der peger mod den nærmeste fisk og lægger den til accelerationen
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

    // Tegner predator som en rød, lidt større trekant
    draw() {
        if (this.dead) {
            super.draw(); // bruger Animal's dødscirkel
            return;
        }

        let theta = this.velocity.heading() + radians(90);
        fill("red");
        stroke(255);
        push();
        translate(this.position.x, this.position.y);
        rotate(theta);
            //front
            beginShape();
                vertex(0, -this.size * 3);    
                vertex(-this.size, 0);         
                vertex(0, this.size * 2);      
                vertex(this.size, 0);          
            endShape(CLOSE);
            // tail 
            beginShape();
                vertex(0, this.size * 2);      
                vertex(-this.size * 1.5, this.size * 4); 
                vertex(this.size * 1.5, this.size * 4);  
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

    // predator mister 1.5 hunger i sekundet og hvis den rammer 0 dør den i draw() løkken
    loseHunger() {
        this.hunger -= 1.5 / 60;
        if (this.hunger < 0) this.hunger = 0;
    }

    // hvis rovfisken har hunger nok, kan den formere sig og lave en ny rovfisk
    spawn(predatorArray) {
        if (this.hunger > 40) {
            let xpos = this.position.x + random(-20, 20);
            let ypos = this.position.y + random(-20, 20);
            let size = 6;
            let catchRadius = 8;
            predatorArray.push(new PredatorFish(xpos, ypos, size, catchRadius));
            this.hunger = 4; // reset hunger efter spawning
        }
    }
}

//------------------------------PREDATORS CONTAINER CLASS------------------------------
// Håndterer alle PredatorFish objekter samlet

class Predators {

    predatorArray = [];

    constructor(amount) {
        for (let i = 0; i < amount; i++) {
            let xpos = random(0, width);
            let ypos = random(0, height);
            this.predatorArray.push(new PredatorFish(xpos, ypos, 6, 8));
        }
    }

    draw() {
        for (let predator of this.predatorArray) {
            predator.draw();
        }
    }

    move(fishArray) {
        for (let predator of this.predatorArray) {
            if (predator.dead) continue; // døde rovfisk bevæger sig ikke
            predator.hunt(fishArray);
            predator.separateFromPredators(this.predatorArray);
            predator.move(); // arvet fra Animal
            predator.moveToStart(); // arvet fra Animal
            predator.catchFish(fishArray);
            predator.loseHunger();
            predator.spawn(this.predatorArray);

            if (predator.hunger <= 0) {
                predator.dead = true; // markér som død når sulten når 0
            }
        }

        // fjern rovfisk der er spist af en ådselæder
        for (let i = this.predatorArray.length - 1; i >= 0; i--) {
            if (this.predatorArray[i].eaten) {
                this.predatorArray.splice(i, 1); // fjern den spiste rovfisk fra arrayet
            }
        }
    }
}

// For at kunne importere PredatorFish-klassen i unit-test
if (typeof module !== 'undefined') {
    module.exports = { PredatorFish };
}