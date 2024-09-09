function NutrientsTimeSeries() {

  // Name for the visualisation to appear in the menu bar.
  this.name = 'Nutrients: 1974-2016';

  // Each visualisation must have a unique ID with no special characters.
  this.id = 'nutrients-time-series';

  // Title to display above the plot.
  this.title = 'Nutrients Time Series: Percentage over the Years.';

  // Names for each axis.
  this.xAxisLabel = 'year';
  this.yAxisLabel = '%';

  this.colors = []

  var marginSize = 35;

  // Layout object to store all common plot layout parameters and methods.
  this.layout = {
    marginSize: marginSize,

    // Locations of margin positions. Left and bottom have double margin size due to axis and tick labels.
    leftMargin: marginSize * 6,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: height - marginSize * 2,
    pad: 5,

    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function() {
      return this.bottomMargin - this.topMargin;
    },

    // Boolean to enable/disable background grid.
    grid: true,

    // Number of axis tick labels to draw so that they are not drawn on top of one another.
    numXTickLabels: 10,
    numYTickLabels: 8,
  };

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data. This function is called automatically by the gallery when a visualisation is added.
  this.preload = function() {
    var self = this;
    this.data = loadTable(
      'data/food-copy/nutrients74-16.csv', 'csv', 'header',
      // Callback function to set the value this.loaded to true.
      function(table) {
        self.loaded = true;
      }
    );
  };

  this.setup = function() {
    // Font defaults.
    textSize(16);

    // Set min and max years: assumes data is sorted by date.
    this.startYear = Number(this.data.columns[1]);
    this.endYear = Number(this.data.columns[this.data.columns.length - 1]);

    for (var i = 0; i < this.data.getRowCount(); i++) {
      this.colors.push(color(random(255), random(255), random(255)));
    }

    // Find min and max percentage for mapping to canvas height.
    this.minPercentage = 80;  // Minimum percentage.
    this.maxPercentage = 350; // Maximum percentage.
  };

  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    // Draw the title above the plot.
    this.drawTitle();

    // Draw all y-axis labels.
    drawYAxisTickLabels(this.minPercentage,
                        this.maxPercentage,
                        this.layout,
                        this.mapPercentageToHeight.bind(this),
                        0);

    // Draw x and y axis.
    drawAxis(this.layout);

    // Draw x and y axis labels.
    drawAxisLabels(this.xAxisLabel,
                   this.yAxisLabel,
                   this.layout);

    // Plot all percentages between startYear and endYear using the width of the canvas minus margins.
    var previous;
    var numYears = this.endYear - this.startYear + 1;

    // Store y postions for the labels
    var lPosition = [];

    // Loop over all rows and draw a line from the previous value to the current.
    for (var i = 0; i < this.data.getRowCount(); i++)
    {
      var row = this.data.getRow(i);
      var previous = null;
      var l = row.getString(0);

      // Loop over each year's data for the current nutrient
      for (var j = 1; j < numYears; j++) {
        // Create an object to store data for the current year.
        var current = {
          // Convert strings to numbers.
          'year': this.startYear + j - 1,
          'percentage': row.getNum(j),
        };

        if (previous != null) {
          // Draw line segment connecting previous year to current year percentage.
          stroke(this.colors[i]);
          line(this.mapYearToWidth(previous.year),
               this.mapPercentageToHeight(previous.percentage),
               this.mapYearToWidth(current.year),
               this.mapPercentageToHeight(current.percentage));
        }
        // Assign current year to previous year so that it is available during the next iteration of this loop to give us the start position of the next line segment.
        previous = current;
      }

      // Draw label only for the first data point
      noStroke();
      fill(this.colors[i]);
      textSize(12);
      textAlign(RIGHT);

      // Adjust Labels position
      var textX = this.layout.leftMargin - 30;
      var originalTextY = this.mapPercentageToHeight(row.getNum(1)) - 10;
      var textY = originalTextY;

      // Adjust position to avoid overlap
    for (var k = 0; k < lPosition.length; k++) {
      if (dist(textX, textY, lPosition[k].x, lPosition[k].y) < 20) {
        textY = lPosition[k].y + 20; // Shift down by 20 if overlapping
        k = -1; // Mandatory to restart the loop to avoid the overlapping.
      }
    }

    // Store the new label position
    lPosition.push({x: textX, y: textY});

    // Draw a rectangle to wrap the labels *Improve Visibility*
    var labelWidth = textWidth(l) + 10;
    var labelHeight = 20;

    fill(255);
    stroke(1)
    rect(textX - labelWidth, textY - 15, labelWidth, labelHeight);

    fill(this.colors[i]);
    text(l, textX, textY);
  }

  // Learned to use .bind function to ensure var retains the correct this
  for (var year = this.startYear; year <= this.endYear; year++) {
    if (year % 5 == 0) {
      drawXAxisTickLabel(year, this.layout, this.mapYearToWidth.bind(this));
    }
  }

  // I lost 12 hours till I find out labels were overlapping xD
  // console.log('Number of labels: ' + this.data.getRowCount());
};
  this.drawTitle = function() {
    fill(0);
    noStroke();
    textAlign('center', 'center');

    text(this.title,
         (this.layout.plotWidth() / 2) + this.layout.leftMargin,
         this.layout.topMargin - (this.layout.marginSize / 2));
  };

  this.mapYearToWidth = function(value) {
    return map(value,
               this.startYear,
               this.endYear,
               this.layout.leftMargin,   // Draw left-to-right from margin.
               this.layout.rightMargin);
  };

  this.mapPercentageToHeight = function(value) {
    return map(value,
               this.minPercentage,
               this.maxPercentage,
               this.layout.bottomMargin, // Smaller percentage at bottom.
               this.layout.topMargin);   // Bigger percentage at top.
  };
}
