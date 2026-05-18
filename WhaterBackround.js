let points =[];

function setup() {
    createCanvas(width, height);
    angleMode(DEGREES); 
    stroke(255); //Hvid farve på stregerne
    strokeWeight(10); //Gir tykke steger 

    // Generer tilfældige punkter og gem dem i arrayet
    for(let i = 0; i < 100; i++) {
        points[i] = createVector(random(width), random(height)); 
    }
}

function draw() {
    background(0);

    loadPixels(); // Indlæs pixeldata for at kunne manipulere det
    
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let index = (x + y * width) * 4; // Beregn pixelindeks (4 for RGBA)
            pixels[index] = 44;     // R (0-255)
            pixels[index + 1] = 169; // G (0-255)
            pixels[index + 2] = 255; // B (0-255)
            pixels[index + 3] = 255; // A (0-255)
        }      
}
    updatePixels(); // Opdater canvas med de ændrede pixeldata

    beginShape(points);
    for(let i = 0; i < points.length; i++) {
        vertex(points[i].x, points[i].y); // Tegn linjer mellem punkterne

        endShape();
    }
}
}
