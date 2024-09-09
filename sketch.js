
// Global variable to store the gallery object. The gallery object is
// a container for all the visualisations.
var gallery;

function setup() {
  // Create a canvas to fill the content div from index.html.
  canvasContainer = select('#app');
  var c = createCanvas(1024, 576);
  c.parent('app');

  // Create a new gallery object.
  gallery = new Gallery();

  // Add the visualisation objects here.
  gallery.addVisual(new TechDiversityRace());
  gallery.addVisual(new TechDiversityGender());
  gallery.addVisual(new PayGapByJob2017());
  gallery.addVisual(new PayGapTimeSeries());
  gallery.addVisual(new ClimateChange());
  gallery.addVisual(new UkFoosAttitudes());
  gallery.addVisual(new NutrientsTimeSeries());
  // Assistance from Course Material
  gallery.addVisual(new PokemonStats());
  // End of code

  //Scroll down the canvas in Pokémon page
  c.mouseWheel(function(event) {
    if (gallery.selectedVisual != null && gallery.selectedVisual.hasOwnProperty('mouseWheel')) {
      gallery.selectedVisual.mouseWheel(event);
    }
  });
}

function draw() {
  background(255);
  if (gallery.selectedVisual != null) {
    gallery.selectedVisual.draw();
  }
}
