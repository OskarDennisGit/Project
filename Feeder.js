//------------------------------FEEDER CLASS (extender Animal)----------------------
// Ådselæder der spiser lig af døde dyr 

class Feeder extends Animal {

    constructor(x, y, size) {
        super(x, y, size);          // nedarv position, velocity, acceleration mv. fra Animal
        this.maxSpeed = 1.5;         // langsommere end fisk
        this.maxSteeringForce = 0.8;
        this.hunger = 10;            // starter med lidt hunger
        this.eatRadius = size * 3;   // radius for at spise lig
        this.hasSpawnedPlant = false; // Boolean for at sikre kun én plante per gang den rammer hunger 12, ellers ville den spawne en plante hver frame når hunger er over 12
    }

    // tegner ådselæderen som en mørkegrøn oval med 3 ben på hver side
    drawAlive() {
        let theta = this.velocity.heading() + radians(90);
        push();
        translate(this.position.x, this.position.y);
        rotate(theta);

        stroke(255);
        strokeWeight(1);

        // ben på venstre side
        line(-this.size, -this.size,      -this.size * 2.5, -this.size * 1.8);
        line(-this.size,  0,              -this.size * 2.5,  0);
        line(-this.size,  this.size,      -this.size * 2.5,  this.size * 1.8);

        // ben på højre side
        line(this.size, -this.size,       this.size * 2.5, -this.size * 1.8);
        line(this.size,  0,               this.size * 2.5,  0);
        line(this.size,  this.size,       this.size * 2.5,  this.size * 1.8);

        // kroppen oven på benene
        fill(0, 80, 0); // mørkegrøn
        ellipse(0, 0, this.size * 2, this.size * 4);

        pop();

        // Vis hunger (bruger Animal's displayHunger)
        this.displayHunger();
    }

    // finder nærmeste lig i både fisk og predator arrayet
    seekCorpse(fishArray, predatorArray, feederArray) {
        // vi kender endnu ikke det nærmeste lig
        let closest = null;
        let closestDist = Infinity;

        // løb alle fisk igennem og find det nærmeste lig
        for (let fish of fishArray) {
            if (!fish.dead) continue; // ignorer levende fisk
            let d = p5.Vector.dist(this.position, fish.position);
            if (d < closestDist) {
                closestDist = d;
                closest = fish;
            }
        }

        // tjek også døde rovfisk
        for (let predator of predatorArray) {
            if (!predator.dead) continue; // ignorer levende rovfisk
            let d = p5.Vector.dist(this.position, predator.position);
            if (d < closestDist) {
                closestDist = d;
                closest = predator;
            }
        }

        // tjek også døde feeders
        for (let feeder of feederArray) {
            if (!feeder.dead) continue; // ignorer levende feeders
            if (feeder === this) continue; // ignorer dig selv
            let d = p5.Vector.dist(this.position, feeder.position);
            if (d < closestDist) {
                closestDist = d;
                closest = feeder;
            }
        }

        // hvis der er et lig et sted, styr mod det med dobbelt styrke
        if (closest !== null) {
            let steering = this.seek(closest.position);
            steering.mult(2);
            this.acceleration.add(steering);
        }
    }

    // spiser lig inden for eatRadius og øger hunger
    eatCorpse(fishArray, predatorArray, feederArray) {
        // løb gennem alle fisk
        for (let i = fishArray.length - 1; i >= 0; i--) {
            if (!fishArray[i].dead) continue; // ignorer levende fisk

            let d = p5.Vector.dist(this.position, fishArray[i].position);

            // hvis scavengeren er tæt nok på liget, spis det
            if (d < this.eatRadius) {
                fishArray.splice(i, 1); // fjern liget
                this.hunger += 1;
            }
        }

        // samme logik for døde rovfisk
        for (let i = predatorArray.length - 1; i >= 0; i--) {
            if (!predatorArray[i].dead) continue; // ignorer levende rovfisk

            let d = p5.Vector.dist(this.position, predatorArray[i].position);

            if (d < this.eatRadius) {
                predatorArray[i].eaten = true; // markér som spist så predator-løkken fjerner den
                this.hunger += 2; // rovfisk giver mere næring end almindelige fisk
            }
        }

        // spis døde feeders
        for (let i = feederArray.length - 1; i >= 0; i--) {
            if (!feederArray[i].dead) continue; // ignorer levende feeders
            if (feederArray[i] === this) continue; // spis ikke dig selv

            let d = p5.Vector.dist(this.position, feederArray[i].position);

            if (d < this.eatRadius) {
                feederArray.splice(i, 1); // fjern liget
                this.hunger += 1;
            }
        }
    }

    // formerer sig hvis hunger er høj nok
    spawn(feederArray) {
        // spawn kun én plante når hunger rammer 12
        if (this.hunger >= 12 && !this.hasSpawnedPlant) {
            food.push(new Mad(this.position.x, this.position.y));
            this.hasSpawnedPlant = true; // sæt flaget så den ikke spawner igen
        }

        // formerer sig når hunger rammer 25 og nulstiller flaget
        if (this.hunger > 14) {
            let xpos = this.position.x + random(-10, 10);
            let ypos = this.position.y + random(-10, 10);
            feederArray.push(new Feeder(xpos, ypos, this.size));
            this.hunger = 5;
            this.hasSpawnedPlant = false; // nulstil så den kan spawne igen næste gang
        }
    }

    // seperate fra andre feeders
    separate(feederArray) {
        let desiredSeparation = 30;
        let total = createVector(0, 0);
        let count = 0;

        for (let i = 0; i < feederArray.length; i++) {
            if (feederArray[i].dead) continue;
            let d = p5.Vector.dist(this.position, feederArray[i].position);
            if (d > 0 && d < desiredSeparation) {
                let difference = p5.Vector.sub(this.position, feederArray[i].position);
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
    
    //override loseHunger for at gøre ådselæderens hunger mindre hurtigt faldende
    loseHunger() {
        this.hunger -= 0.25 / 60;
        if (this.hunger < 0) this.hunger = 0;
    }
}

//------------------------------FEEDERS CONTAINER CLASS------------------------------
// Håndterer alle Feeder objekter samlet

class Feeders {

    feederArray = [];

    constructor(amount) {
        for (let i = 0; i < amount; i++) {
            let xpos = random(0, width);
            let ypos = random(0, height);
            this.feederArray.push(new Feeder(xpos, ypos, 4));
        }
    }

    draw() {
        for (let feeder of this.feederArray) {
            feeder.draw();
        }
    }

    move(fishArray, predatorArray) {
        for (let i = this.feederArray.length - 1; i >= 0; i--) {
            let feeder = this.feederArray[i];
            if (feeder.dead) continue; // døde feeders bevæger sig ikke
            feeder.seekCorpse(fishArray, predatorArray, this.feederArray);
            feeder.separate(this.feederArray);
            feeder.move(); // arvet fra Animal
            feeder.moveToStart(); // arvet fra Animal
            feeder.eatCorpse(fishArray, predatorArray, this.feederArray);
            feeder.loseHunger();
            feeder.spawn(this.feederArray);

            if (feeder.hunger <= 0) {
                feeder.dead = true; // markér som død når sulten når 0
            }
        }
    }
}
//for at kunne importere Feeder-klassen i unit-test
if (typeof module !== 'undefined') {
  module.exports = { Feeder };
}