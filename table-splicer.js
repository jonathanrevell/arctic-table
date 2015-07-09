(function(exports){

  // Allows you to independently work with individual rows and columns
  var TableSplicer = {

    // Clone the given segment (row, col, thead) into the specified region of a
    // cloned table "shell" (region being: thead, tbody, tfoot, or directly onto the table)
    // Dimension: 'row' or 'col'
    cloneSegment: function( table, segment, dimension, region ) {
      var $segment    = $(segment),
          $table      = $(table),
          $clonedTable,
          $clonedSegment;


      if(dimension == 'row') {
        // Clone a ROW

        $clonedTable = this.getEmptyCloneOfTable( $table );
        $clonedSegment = $segment.clone();

        // Region: tbody, thead, tfoot
        if(arguments.length > 2 && region && region != 'table') {
          // Cloning just a row
          $clonedTable.find(region).append($clonedSegment);
        } else {
          // Remove the region from the table if it already exists
          var tagName = $clonedSegment.prop("tagName");
          $clonedTable.find(tagName).remove();

          // Append the region onto the table
          $clonedTable.append($clonedSegment);
        }

      } else if(dimension == 'col') {
        // Clone a COLUMN

        $clonedTable = this.cloneColumnByFiltering( $table, segment);
      }

      $clonedTable.css('max-width', $table.width());
      return $clonedTable;
    },
    cloneColumnByFiltering: function( $table, column ) {
      var $clonedTable = $table.clone(),
          partialSelector = ':nth-child(' + colIdx + ')';

      // Remove all cells from the clone that
      $clonedTable.find(':not(td' + partialSelector + ')').remove();
      $clonedTable.find(':not(th' + partialSelector + ')').remove();

      this.generateColsForTableClone( $table, $clonedTable );
      return $clonedTable;
    },
    cloneRow: function( table, row ) {
      return this.cloneSegment( table, row, 'row', 'tbody');
    },
    cloneColumn: function( table, col ) {
      return this.cloneSegment( table, col, 'row', 'table');
    },
    cloneHeader: function( table ) {
      return this.cloneSegment( table, $(table).find('thead'), 'row');
    },
    cloneHeaderRow: function( table, row ) {
      return this.cloneSegment( table, row, 'row', 'thead');
    },
    cloneFooter: function( table ) {
      return this.cloneSegment( table, $(table).find('tfoot'), 'row');
    },
    cloneFooterRow: function( table, row ) {
      return this.cloneSegment( table, row, 'row', 'tfoot');
    },

    // We have to build 'col' elements in order to enforce sizing
    generateColsForTableClone: function( table, clone ) {
      var $table      = $(table),
          $clone      = $(clone),

          $sampleCells  = $table.find('tr:first-child td');

      this.fillColsInTableClone( table, clone );

      // For each cell, copy its width for the appropriate column
      var widths = _.map( $sampleCells, function( cell ) {
        return  $(cell).width();
      });

      var zipped = _.zip( $clone.find('colgroup col'), widths);

      _.each( zipped, function( item ) {
        var $el     = $(item[0]),
            width   = item[1];
        $el.width( width );
      });
    },
    // Checks if the source table already has columns and fills in any
    // missing ones
    fillColsInTableClone: function( table, clone ) {
      var $table      = $(table),
          $clone      = $(clone),

          $sampleRow    = $table.find('tr:first-child'),
          $colGroup     = $table.find('colgroup'),

          $cloneCols;

      if($colGroup.length === 0) {
        $colGroup = $('<colgroup></colgroup>');
        $clone.prepend( $colGroup );
      }
      $cloneCols    = $colGroup.find('col');

      while($colGroup.find('col').length < $sampleRow.find('td').length) {
        $colGroup.append('<col></col>');
      }
    },

    // We have to build an approximation of the table in order to retain the size
    // and positioning of the row and its cells
    getEmptyCloneOfTable: function( table ) {
      var $table = $(table),
          $clone = $table.clone();

      $clone.find('tbody').html('');
      $clone.find('thead').html('');
      $clone.find('tfoot').html('');

      this.generateColsForTableClone( $table, $clone );
      return $clone;
    },
  };

  exports.TableSplicer = TableSplicer;
})(window);
