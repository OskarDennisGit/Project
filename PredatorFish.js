//------------------------------PREDATORFISH CLASS (extender Animal)----------------------
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

    // predator mister 1.5 hunger i sekundet og hvis den rammer 0 dør den i draw() løkken
    loseHunger() {
        this.hunger -= 1.5 / 60;
        if (this.hunger < 0) this.hunger = 0;
    }

    // hvis rovfisken har hunger nok, kan den formere sig og lave en ny rovfisk
    spawn() {
        if (this.hunger > 40) {
            let xpos = this.position.x + random(-20, 20);
            let ypos = this.position.y + random(-20, 20);
            let size = 6;
            let catchRadius = 8;
            predators.push(new PredatorFish(xpos, ypos, size, catchRadius));
            this.hunger = 4; // reset hunger efter spawning
        }
    }
}