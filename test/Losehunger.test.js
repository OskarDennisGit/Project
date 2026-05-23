//use strict gør at vi får fejl hvis vi prøver at bruge en variabel der ikke er defineret
'use strict';

// importer expect fra chai, som vi bruger til at tjekke om resultaterne er korrekte
const expect = require('chai').expect;

// importer vores klasser fra de respektive filer
const { Animal } = require('../animal.js');
const { PredatorFish } = require('../PredatorFish.js');

// ─────────────────────────────────────────────────────────────────────────────
// MOCKS
// ─────────────────────────────────────────────────────────────────────────────
// Vores klasser bruger p5.js funktioner som createVector() og random()
// Disse funktioner findes normalt kun i en browser, ikke i Node.js
// I stedet for at importere hele p5.js laver vi enkle mock-versioner
// der opfylder præcis det vores klasser har brug for
// Denne tilgang er inspireret af Andy Timmons' p5.js unit testing guide
// ─────────────────────────────────────────────────────────────────────────────

// mock af p5's createVector
// Predator arver Animal's konstruktør, som kalder createVector() for at lave position,
// velocity og acceleration. Vi laver en simpel version der returnerer
// et objekt med de samme egenskaber og metoder som p5's Vector
global.createVector = function(x, y) {
    return {

        x: x || 0,
        y: y || 0,
        // add bruges i move() til at lægge acceleration til velocity
        add: function(v) {
            this.x += v.x;
            this.y += v.y;
        },
        // mult bruges i move() til at nulstille acceleration
        mult: function(n) {
            this.x *= n;
            this.y *= n;
        },
        // limit bruges i move() til at begrænse hastigheden
        limit: function() {}
    };
};

// mock af p5's random
// Animal's konstruktør kalder random() for at give dyret
// en tilfældig startretning — vi bruger bare Math.random()
global.random = function(min, max) {
    return Math.random() * (max - min) + min;
};

// width og height bruges i moveToStart() til wrap-around logik
// vi sætter dem til de samme værdier som i det rigtige program
global.width = 1500;
global.height = 1000;

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

// describe grupperer alle tests der handler om PredatorFish's loseHunger
describe('PredatorFish loseHunger()', function() {

    // predator oprettes her så alle tests i describe-blokken kan bruge den
    let predator;

    // beforeEach køres automatisk før hver enkelt test
    // her opretter vi en frisk PredatorFish instans
    // så hver test starter med det samme udgangspunkt
    // og ikke påvirkes af hvad den forrige test gjorde
    beforeEach(function() {
        predator = new PredatorFish(0, 0, 6, 8);
    });

    // PredatorFish mister præcis 1.5/60 hunger per kald
    // dette er deterministisk og kan testes direkte
    it('should lose 1.5/60 hunger per call', function(done) {
        let hungerFør = predator.hunger;

        predator.loseHunger();

        // closeTo tillader en meget lille afvigelse
        // pga. floating point aritmetik i JavaScript
        expect(predator.hunger).to.be.closeTo(hungerFør - (1.5 / 60), 0.0001);
        done();
    });
});