
class Scavenger extends Fish {
    constructor(x, y, size) {
        super(x, y, size);
        this.maxSpeed = 1.5;         // langsommere end fisk
        this.maxSteeringForce = 0.8;
        this.hunger = 10;            // starter med lidt hunger
        this.eatRadius = size * 3;   // radius for at spise lig
        this.hasSpawnedPlant = false; // Boolean for at sikre kun én plante per scavenger
    }

    // tegner ådselæderen som en mørkegrøn oval med 3 ben på hver side
draw() {
    if (this.dead) {
        fill(150);
        noStroke();
        circle(this.position.x, this.position.y, this.size * 2);
        return;
    }

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
}

// finder nærmeste lig i både fisk og predator arrayet
seekCorpse(fishArray, predatorArray, scavengerArray) {
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

    // tjek også døde scavengers
    for (let scavenger of scavengerArray) {
        if (!scavenger.dead) continue; // ignorer levende scavengers
        if (scavenger === this) continue; // ignorer dig selv
        let d = p5.Vector.dist(this.position, scavenger.position);
        if (d < closestDist) {
            closestDist = d;
            closest = scavenger;
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
eatCorpse(fishArray, predatorArray, scavengerArray) {
    // løb gennem alle fisk baglæns så vi kan splice uden at springe nogen over
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

    // spis døde scavengers
    for (let i = scavengerArray.length - 1; i >= 0; i--) {
        if (!scavengerArray[i].dead) continue; // ignorer levende scavengers
        if (scavengerArray[i] === this) continue; // spis ikke dig selv

        let d = p5.Vector.dist(this.position, scavengerArray[i].position);

        if (d < this.eatRadius) {
            scavengerArray.splice(i, 1); // fjern liget
            this.hunger += 1;
        }
    }
}

    // formerer sig hvis hunger er høj nok
spawn(scavengersArray) {
    // spawn kun én plante når hunger rammer 12
    if (this.hunger >= 12 && !this.hasSpawnedPlant) {
        food.push(new Mad(this.position.x, this.position.y));
        this.hasSpawnedPlant = true; // sæt flaget så den ikke spawner igen
    }

    // formerer sig når hunger rammer 25 og nulstiller flaget
    if (this.hunger > 14) {
        let xpos = this.position.x + random(-10, 10);
        let ypos = this.position.y + random(-10, 10);
        scavengersArray.push(new Scavenger(xpos, ypos, this.size));
        this.hunger = 5;
        this.hasSpawnedPlant = false; // nulstil så den kan spawne igen næste gang
    }
}

    // wrap-around logik for at holde ådselæderen inden for canvaset
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

separate(scavengerArray) {
    let desiredSeparation = 30;
    let total = createVector(0, 0);
    let count = 0;

    for (let i = 0; i < scavengerArray.length; i++) {
        if (scavengerArray[i].dead) continue;
        let d = p5.Vector.dist(this.position, scavengerArray[i].position);
        if (d > 0 && d < desiredSeparation) {
            let difference = p5.Vector.sub(this.position, scavengerArray[i].position);
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
}
    