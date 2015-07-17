(function(exports, TableSplicer){

  var ArcticTable = function( table, root ) {
    this.$table   = $(table);
    this.$wrapper = null;
    this.$root    = root || null;

    this.frozenColumns = [];

    this.setupDOM( root );
    this.setupResizeListener();
  };

  ArcticTable.prototype = {
    setupDOM: function( root ) {
      var rootTemplate = "<div class='arctic-table'></div>",
          wrapTemplate = "<div class='arctic-table-wrapper'></div>";

      if(!root) {
        this.$table.wrap(rootTemplate);
        this.$root = this.$table.parent();
      } else {
        this.$root.addClass("arctic-table");
      }

      this.$table.wrap(wrapTemplate);
    },
    freezeColumn: function( col ) {
      var $frozenColumn = TableSplicer.cloneColumn( this.$table, col );
      $frozenColumn.addClass('frozen-column');

      this.frozenColumns.push({
        index: col,
        el: $frozenColumn
      });

      this.toggleColumnVisibility( col, true);
      this.$root.append($frozenColumn);
    },
    toggleColumnVisibility: function( col, makeVisible ) {
      var partialSelector = ':nth-child(' + col + ')',
          state = makeVisible ? 'visible' : 'hidden';

      this.$table.find('td' + partialSelector + ', th' + partialSelector).css('visibility', state);
    },
    rebuildFrozenColumns: function() {
      var self = this,
          indexes;

      indexes = this.removeFrozenColumnsFromDOM();
      _.each( indexes, function( col ) {
        self.freezeColumn(col);
      });
    },
    removeFrozenColumnsFromDOM: function() {
      var indexes = [];
      _.each( this.frozenColumns, function( col ) {
        col.el.remove();
        col.el = null;
        indexes.push(col.index);
      });

      this.frozenColumns = [];
      return indexes;
    },
    setupResizeListener: function() {
      var self = this;
      $(document).on('resize', function() {
        self.rebuildFrozenColumns();
      });
    }
  };

  exports.ArcticTable = ArcticTable;
})(window, TableSplicer);
