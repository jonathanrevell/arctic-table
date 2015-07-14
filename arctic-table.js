(function(exports, TableSplicer){

  var ArcticTable = function( table ) {
    this.$table   = $(table);
    this.$wrapper = null;
    this.$root    = null;

    this.setupDOM();
  };

  ArcticTable.prototype = {
    setupDOM: function() {
      var rootTemplate = "<div class='arctic-table'></div>",
          wrapTemplate = "<div class='arctic-table-wrapper'></div>";

      this.$table.wrap(rootTemplate);
      this.$root = this.$table.parent();

      this.$table.wrap(wrapTemplate);
    },
    freezeColumn: function( col ) {
      var $frozenColumn = TableSplicer.cloneColumn( this.$table, col );
      $frozenColumn.addClass('frozen-column');

      this.toggleColumnVisibility( col, true);
      this.$root.append($frozenColumn);
    },
    toggleColumnVisibility: function( col, makeVisible ) {
      var partialSelector = ':nth-child(' + col + ')',
          state = makeVisible ? 'visible' : 'hidden';

      this.$table.find('td' + partialSelector + ', th' + partialSelector).css('visibility', state);
    }
  };

  exports.ArcticTable = ArcticTable;
})(window, TableSplicer);
