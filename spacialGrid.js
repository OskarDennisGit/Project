//use strict gør at vi får fejl hvis vi prøver at bruge en variabel der ikke er defineret
'use strict';

// importer expect fra chai
const expect = require('chai').expect;

// importer SpacialGrid og Cell fra vores projektfil
const { SpacialGrid, Cell } = require('../spacialGrid.js');

// ─────────────────────────────────────────────────────────────────────────────
// MOCKS
// ─────────────────────────────────────────────────────────────────────────────
// SpacialGrid bruger ikke p5's funktioner direkte, men konstruktøren
// læser width og height som globale værdier for at beregne antal rækker og kolonner.
// Vi sætter dem til de samme værdier som i det rigtige program.
global.width = 1500;
global.height = 1000;

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

// describe grupperer alle tests der handler om SpacialGrid
describe('SpacialGrid', function() {

    // grid erklæres her uden værdi så den er tilgængelig i hele describe-blokken,
    // men selve objektet oprettes i beforeEach så hver test får et frisk grid
    let grid;

    // beforeEach køres automatisk før hver enkelt test og opretter
    // et nyt SpacialGrid med cellestørrelse 50 — samme opsætning som i programmet
    beforeEach(function() {
        grid = new SpacialGrid(50);
    });

    // describe grupperer alle tests der handler om clear()-metoden
    describe('clear()', function() {

        // test 1:
        // vi tilføjer tre fisk til forskellige celler i gridet via addBoid(),
        // kalder clear(), og løber derefter alle celler igennem for at tjekke
        // at ingen af dem stadig indeholder fisk.
        // found starter som false og sættes til true hvis en celle ikke er tom —
        // til sidst forventer vi at found stadig er false.
        it('should empty all cells after clear', function(done) {
            let fish1 = { position: { x: 75, y: 75 } };    // celle (1,1)
            let fish2 = { position: { x: 200, y: 300 } };  // celle (4,6)
            let fish3 = { position: { x: 800, y: 600 } };  // celle (16,12)

            grid.addBoid(fish1);
            grid.addBoid(fish2);
            grid.addBoid(fish3);

            grid.clear();

            let found = false;
            for (let row of grid.grid) {
                for (let cell of row) {
                    if (cell.boids.length > 0) found = true;
                }
            }
            expect(found).to.equal(false);
            done();
        });

        // test 2:
        // clear() kaldes på et helt tomt grid uden at vi har tilføjet nogen fisk.
        // vi pakker kaldet ind i en funktion og bruger .to.not.throw() —
        // testen sikrer at clear() håndterer et tomt grid uden at kaste en fejl.
        it('should not throw on empty grid', function(done) {
            expect(function() {
                grid.clear();
            }).to.not.throw();
            done();
        });

    });

});