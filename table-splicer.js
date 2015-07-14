(function(exports){

  // Allows you to independently work with individual rows and columns
  var TableSplicer = {

    // Clone the given segment (row, col, thead) into the specified region of a
    // cloned table "shell" (region being: thead, tbody, tfoot, or directly onto the table)
    // Dimension: 'row' or 'col'
    cloneSegment: function( table, segment, dimension, region ) {
      var $table      = $(table),
          $clonedTable,
          $clonedSegment;


      if(dimension == 'row') {
        // Clone a ROW

        if(_.isNumber(segment)) {
          segment = $table.find(region + ' tr:nth-child(' + segment + ')');
        }
        var $segment = $(segment);

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
    cloneColumnByFiltering: function( $table, colIdx ) {
      var $clonedTable = $table.clone(),
          partialSelector = ':nth-child(' + colIdx + ')';

      this.sanitzeClone( $clonedTable );
      this.matchCellHeights( $table, $clonedTable, colIdx );

      // Remove all cells from the clone that
      $clonedTable.find('td:not(' + partialSelector + ')').remove();
      $clonedTable.find('th:not(' + partialSelector + ')').remove();

      this.generateColsForTableClone( $table, $clonedTable );
      return $clonedTable;
    },
    cloneRow: function( table, row ) {
      return this.cloneSegment( table, row, 'row', 'tbody');
    },
    cloneColumn: function( table, col ) {
      return this.cloneSegment( table, col, 'col', 'table');
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

    // For each row in the clone, match the source height
    matchCellHeights: function( table, clone, colIdx ) {
      var $table = $(table),
          $clone = $(clone);

      this.matchCellHeightsForRegion( $table, $clone, colIdx, 'thead' );
      this.matchCellHeightsForRegion( $table, $clone, colIdx, 'tbody' );
      this.matchCellHeightsForRegion( $table, $clone, colIdx, 'tfoot' );
      // heights.thead = _.map( $table.find('thead th:nth-child(' + colIdx  +  ')'), function( cell ) {
      //   return $(cell).height();
      // });
      // _.each( heights.thead, function( height, idx ) {
      //   $clone.find('thead tr:nth-child(' + idx + ') th').height( height );
      // });
      //
      // heights.tbody = _.map( $table.find('tbody td:nth-child(' + colIdx  +  ')'), function( cell ) {
      //   return $(cell).height();
      // });
      // _.each( heights.thead, function( height, idx ) {
      //   $clone.find('tbody tr:nth-child(' + idx + ') td').height( height );
      // });
      //
      // heights.tfoot = _.map( $table.find('tfoot th:nth-child(' + colIdx  +  ')'), function( cell ) {
      //   return $(cell).height();
      // });
      // _.each( heights.thead, function( height, idx ) {
      //   $clone.find('tfoot tr:nth-child(' + idx + ') th').height( height );
      // });
    },

    matchCellHeightsForRegion: function( $table, $clone, colIdx, region ) {
      var tag = (region == 'tbody') ? 'td' : 'th',
          heights;

      heights = _.map( $table.find(region + ' ' + tag + ':nth-child(' + colIdx  +  ')'), function( cell ) {
        return $(cell).outerHeight();
      });
      _.each( heights, function( height, idx ) {
        var row = idx + 1;
        $clone.find(region + ' tr:nth-child(' + row + ') ' + tag).height( height );
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

    // Performs some basic sanitization functions such as removing ids
    sanitzeClone: function( $table ) {
      $table.attr('id', '');
      return $table;
    },

    // We have to build an approximation of the table in order to retain the size
    // and positioning of the row and its cells
    getEmptyCloneOfTable: function( table ) {
      var $table = $(table),
          $clone = $table.clone();

      // Clear the id off the clone
      this.sanitzeClone( $clone );

      $clone.find('tbody').html('');
      $clone.find('thead').html('');
      $clone.find('tfoot').html('');

      this.generateColsForTableClone( $table, $clone );
      return $clone;
    },
  };

  exports.TableSplicer = TableSplicer;
})(window);
