//MID TERM OBSERVATIONS
// All the code writen in this page was made by me
// We can find Some parts commented that is being used for try to solve the challenge im facing connecting image to pokemon name
//A lot of the variables are still in progress to use
// bellow astericts show where I'm right now in the project
//I basically connected and load the csv file correctly as seeing in the developer console.

//END TERM OBSERVATIONS
//I've used git hub copilot as assistance in order to help build this code.
//I was stack long hours which could sum up for days in matching image and pokemon name, copilot has helped the final result.
//Unfortunatelly I was not able to delivery all the user story I've created due the complexity of the project.
//OBS P5JS is not the best option to work with Data Visualization but can get the job done.

function PokemonStats() {
  this.name = 'Pokemon Stats';
  this.id = 'pokemon-stats';
  this.loaded = false;
  this.data = null;
  this.pokemonNames = [];
  this.pokemonImages = {};
  this.columnName = "Name";  // Column name for Pokémon names
  this.pokemonData = {}; // Store full data
  this.headers = []; // Store data headers
  this.selectedPokemon = null; // Store selected Pokémon
  this.offsetY = 0; // Offset for scrolling in the canvas
  this.dropdown = null; // Dropdown for selection

  // Load the CSV file with comma delimiter
  this.preload = function() {
    var self = this;
    this.data = loadTable(
      'data/pokemon/pokemon.csv', 'csv', 'header',
      // Callback function to set the value this.loaded to true.
      function(table) {
        self.loaded = true;
        console.log("CSV loaded");
        self.headers = table.columns; // Store headers
      }
    );
  };

  // Method to retrieve a column's values
  this.getColumn = function(columnName) {
    var column = [];
    for (var i = 0; i < this.data.getRowCount(); i++) {
      var value = this.data.getString(i, columnName);
      column.push(value);
    }
    return column;
  };

  // The Setup method just run once every start of the page
  this.setup = function() {
    if (this.loaded) { // Ensure data is loaded before proceeding
      var nameColumn = this.getColumn(this.columnName);

      for (var i = 0; i < nameColumn.length; i++) {
        this.pokemonNames.push(nameColumn[i]);
        // Store full row data
        var rowData = this.data.getRow(i).arr;
        this.pokemonData[nameColumn[i]] = rowData;
      }

      this.loadImages(); // Load images after the names
      this.dropDownMenu(); // Create selection interface
    } else {
      console.error('CSV not loaded yet.');
    }
    this.clearDisplay();
  };

  // Method to load images based on Pokémon names
  this.loadImages = function() {
    var self = this;
    var validNames = new Set();//new <any>(iterable?: Iterable<any> | null | undefined) => Set<any> (+1 overload)

    var loadImagePromises = this.pokemonNames.map((name) => {
      var imgPath = 'data/pokemon/images/' + name + '.png';
      //Lear the use of "=>" a compact way to add a function that can eliminate the curly brakets if contains only a single expression.
      //"Promise" built-in JavaScript object that represents a value which may be available now, in the future, or never
      return new Promise((resolve,reject) => {// reject is not being used but might be in the future. It's a feature of the Promise method
        loadImage(imgPath,
          function(img) {
            self.pokemonImages[name] = img;
            validNames.add(name);
            console.log('Image loaded for ' + name);
            resolve();
          },
          function() {
            console.error('Failed to load image for ' + name + ' from path ' + imgPath);
            resolve(); // Resolve even if failed to avoid blocking
          }
        );
      });
    });

    // After all images are loaded, filter pokemonNames
    Promise.all(loadImagePromises).then(() => {
      self.pokemonNames = Array.from(validNames);
      console.log('Valid Pokémon Names:', self.pokemonNames);
      self.dropDownMenu();//Filter the pokemonNames in the dropDownMenu
    });
  };


  this.draw = function() {

    if (this.loaded) {

      background(220); // Clear the background each frame
      textSize(13);
      textFont('monospace'); // Use a fixed-width font
      textAlign(LEFT);
      fill(0);



      // Display "Scroll down" message
      if (!this.selectedPokemon || this.selectedPokemon == 'Full Pokemon List') {
        fill(200, 0, 0);
        textSize(18);
        text("Scroll down to see ", 750, 340); // Position below header
        text("the full list", 750, 360);
      }

      fill(0)
      textSize(13)

      // Display header, I'm using | because when I drawn greeds the program became extremely slow,
      var headerText = this.headers.join(' | ');
      text(headerText, 100, 20);

      if (this.selectedPokemon && this.selectedPokemon !== 'Full Pokemon List') {
        var name = this.selectedPokemon;
        var rowData = this.pokemonData[name];
        var img = this.pokemonImages[name];
        if (img) {
          image(img, 10, 30, 120, 100); // Display image
          textSize(13);
          fill(0);
          text(rowData.join(' | '), 120, 80); // Display Pokémon data below the image
        } else {
          textSize(13);
          fill(255, 0, 0);
          text('Image not available for ' + name, 120, 60); // Error message
        }
      } else {
        // Display Pokémon data
        for (var i = 0; i < this.pokemonNames.length; i++) {
          var name = this.pokemonNames[i];
          if (this.pokemonImages[name]) {
            var rowData = this.pokemonData[name];
            var yPosition = 60 + i * 80 + this.offsetY; // Adjust y position for each row
            image(this.pokemonImages[name], 10, yPosition - 30, 50, 50); // Display Pokémon image
            text(`${rowData.join(' | ')}`, 100, yPosition); // Display Pokémon data
          }
        }
      }
    } else {
      background(220);
      textSize(16);
      fill(0); // Set text color
      text("Loading...", 10, 30);
    }

  };


  // Method to create de menu to select Pokémons
  this.dropDownMenu = function() {
    var self = this;

    // Ensure data is available before creating the dropdown
    if (!this.pokemonNames.length) {
      console.error('No Pokémon names available to populate the dropdown.');
      return;
    }

    // Clear existing dropdown if it exists to avoid conflict when navigating to other data visualization.
    if (this.dropdown) {
      this.dropdown.remove();
    }

    // Create a new dropdown
    this.dropdown = createSelect();
    this.dropdown.position(350, 600);
    this.dropdown.option('Full Pokemon List');

    // Populate the dropdown menu
    this.pokemonNames.forEach(function(name) {
      if (name && name != "") {
        self.dropdown.option(name);
      }
    });

    // Handle dropdown changes
    this.dropdown.changed(function() {
      self.selectedPokemon = self.dropdown.value();
    });
  };

  // Method to handle mouse wheel for scrolling in the canvas.
  this.mouseWheel = function(event) {
    this.offsetY += event.deltaY;
    this.offsetY = constrain(this.offsetY, -this.data.getRowCount() * 80 + height, 0);
  };

  // Method to clean up when switching away from the Pokémon visualization
  this.destroy = function() {
    if (this.dropdown) {
      this.dropdown.remove();
      this.dropdown = null;
    }
    this.selectedPokemon = null;
    this.offsetY = 0;
  };

  // Did this method because the text was overlapping after change data visualization, to solve the problem was just add textAlign(LEFT)
  // keeping the code because I think is good to clean the canvas to improve performance.
  this.clearDisplay = function() {
    clear(); // Clear the canvas
    this.selectedPokemon = null; // Reset selected Pokémon
    this.offsetY = 0; // Reset scroll offset
  };
}

// *****************
// Link Name to image automatically - DONE
// Load and display the images dynamically - DONE
// Create interface for Pokémons selection. -DONE
// Scroll in the canvas to see the complete list of Pokémons - DONE
// implement the full csv - DONE
// implement  radar chart for comparission NOT COMPLETE

// BUGS
// Fix names of pokemons without images appearing in list - DONE
// Fix names of pokemons appearing in the drop down menu - DONE
// Fix text positions - DONE
// Fix data anomaly positions after change to a different data set - DONE
// Fix drop down menu appearing undefinied names after navigate to different data set - DONE


// TASKS FROM USER STORY
//1 - Access stats of all Pokémonss - DONE
//2 - Display Pokémons image in the screen - DONE
//3 - Find Pokémons by type - NOT COMPLETE
//4 - See the percentage of Pokémons by type - NOT COMPLETE
//5 - Create a list of favorites - NOT COMPLETE
//6 - See detailed profile Pokémons - DONE
//7 - Simulate Batles - NOT COMPLETE
