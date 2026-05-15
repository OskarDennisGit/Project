//--------------------------------------------ANIMAL SUPERCLASS------------------------------
// Deles af alle dyr i simulationen: BoidFish, Predator og Scavenger
class Animal {

    constructor(xpos, ypos, size) {
        this.position = createVector(xpos, ypos);
        this.size = size;

        // random startretning så dyrene ikke alle bevæger sig samme vej
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        this.acceleration = createVector(0, 0);

        this.maxSpeed = 3;
        this.maxSteeringForce = 1.2;

        this.hunger = 6;
        this.dead = false;
    }

    // opdaterer position baseret på velocity og acceleration
    move() {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0); // nulstil acceleration efter hvert frame
    }

    // beregner en steering force mod et givet målpunkt
    seek(target) {
        // vektor fra dyrets position mod målet
        let desired = p5.Vector.sub(target, this.position);

        // normaliser og gang med maxSpeed for at få ønsket hastighed mod målet
        desired.normalize();
        desired.mult(this.maxSpeed);

        // steering force er forskellen mellem ønsket hastighed og nuværende hastighed
        let steering = p5.Vector.sub(desired, this.velocity);
        steering.limit(this.maxSteeringForce);
        return steering;
    }

    // dyr mister 0.5 hunger i sekundet, kan overrides i subklasser
    loseHunger() {
        this.hunger -= 0.5 / 60;
        if (this.hunger < 0) this.hunger = 0;
    }

    // wrap-around, dyret teleporterer til den modsatte side når det forlader canvasset
    moveToStart() {
        if (this.position.x > width + this.size)  this.position.x = 0 - this.size;
        if (this.position.x < 0 - this.size)       this.position.x = width + this.size;
        if (this.position.y > height + this.size)  this.position.y = 0 - this.size;
        if (this.position.y < 0 - this.size)       this.position.y = height + this.size;
    }

    // tegner dyret, håndterer den delte dødscirkel og kalder drawAlive() for det levende udseende
    draw() {
        if (this.dead) {
            fill(150);
            noStroke();
            circle(this.position.x, this.position.y, this.size * 2);
            return; // tegn ikke det levende udseende
        }
        this.drawAlive(); // subklasserne implementerer denne
    }

    // placeholder, subklasserne overskriver denne med deres specifikke udseende
    drawAlive() {}

 // viser hunger over dyret, bruges i både scavenger og predator, boidfish har deres egen implementation
    displayHunger() {
        noStroke();
        fill(255);
        textSize(12);
        text(floor(this.hunger), this.position.x + 10, this.position.y - 10);
    }

//spawn/formering´s fungerer forskelligt for hver type dyr, så den er tom her og overskrives i subklasserne
spawn() {}
}