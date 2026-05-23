'use strict';

// importer expect fra chai
const expect = require('chai').expect;

// importer SpacialGrid og Cell fra vores projektfil
const { SpacialGrid, Cell } = require('../spacialGrid.js');

// SpacialGrid bruger ikke p5's funktioner, men vi definerer
// width og height da de bruges som globale værdier i programmet
global.width = 1500;
global.height = 1000;



// TESTS:
describe('SpacialGrid', function() {

    // grid oprettes her så alle tests i describe-blokken kan bruge den
    let grid;

    // beforeEach opretter et frisk SpacialGrid før hver test
    // med samme dimensioner og cellestørrelse som i det rigtige program
    beforeEach(function() {
        grid = new SpacialGrid(1500, 1000, 50);
    });

    //desribe grupperer alle tests der handler om SpacialGrid's clear() metode
    describe('clear()', function() {


        //test 1: clear() skal tømme alle celler i gridet for fisk
        // tilføj tre fisk til forskellige celler og kald clear()
        // alle cellers boids-array skal derefter være tomme
        it('should empty all cells after clear', function(done) {
            let fish1 = { position: { x: 75, y: 75 } };    // celle (1,1)
            let fish2 = { position: { x: 200, y: 300 } };  // celle (4,6)
            let fish3 = { position: { x: 800, y: 600 } };  // celle (16,12)

            // tilføj fiskene til gridet
            grid.addBoid(fish1);
            grid.addBoid(fish2);
            grid.addBoid(fish3);

            // kald clear() som tømmer alle celler
            grid.clear();

            // løb alle celler igennem og tjek at ingen indeholder fisk
            let found = false;
            for (let row of grid.grid) {
                for (let cell of row) {
                    if (cell.boids.length > 0) found = true;
                }
            }
            expect(found).to.equal(false);
            done();
        });


        //test 2: clear() på et tomt grid skal ikke kaste en fejl
        // clear() på et tomt grid skal ikke kaste en fejl
        it('should not throw on empty grid', function(done) {
            
            
            expect(function() { 
                grid.clear();
            }).to.not.throw();
            done();
        });

    });

});