// TODO: Take auto-complete information from autocompleter in Property.
CLASS({
  name: 'AutocompleteListView',
  package: 'foam.ui.md',
  extendsModel: 'View',

  requires: [ 'foam.ui.md.AddRowView' ],
  imports: [ 'stack' ],
  exports: [
    'acRowView as rowView',
    'addRowToList',
    'queryFactory',
    'removeRowFromList',
    'srcDAO as dao'
  ],

  properties: [
    {
      name: 'data',
      postSet: function(oldValue, newValue) {
        this.updateHTML();
      }
    },
    {
      model_: 'DAOProperty',
      name: 'srcDAO'
    },
    {
      name: 'queryFactory'
    },
    {
      name: 'prop'
    },
    {
      name: 'label',
      defaultValueFn: function() { return this.prop ? this.prop.label : ''; }
    },
    {
      model_: 'ModelProperty',
      name: 'acRowView',
      defaultValue: 'foam.ui.md.DefaultACRowView'
    },
    {
      model_: 'ViewProperty',
      name: 'rowView',
      defaultValue: 'DefaultRowView'
    },
    {
      name: 'className',
      defaultValue: 'AutocompleteListView'
    },
    {
      name: 'tagName',
      defaultValue: 'div'
    },
    {
      name: 'extraClassName',
      defaultValueFn: function() { return Array.isArray(this.data) ? ' array' : ' single'; }
    },
  ],

  templates: [
    // TODO: cleanup CSS
    function CSS() {/*
      .AutocompleteListView {
        padding: 0 0 12px 16px;
        width: 100%;
        border: none;
        position: inherit;
      }
      .AutocompleteListView .acHeader {
        color: #999;
        font-size: 14px;
        font-weight: 500;
        padding: 0 0 16px 0;
        display: flex;
        align-items: center;
        margin-top: -16px;
        padding-bottom: 0;
        flex: 1 0 auto;
      }
      .AutocompleteListView .acHeader .acLabel {
        flex: 1 0 auto;
      }
      .AutocompleteListView .acHeader canvas {
        opacity: 0.76;
      }
      .AutocompleteListView .single canvas {
        display: none;
      }
    */},
    function toInnerHTML() {/*
      <% var isArray = Array.isArray(this.data); %>
      <div class="acHeader"><div class="acLabel">%%label</div><% if ( isArray ) { %> $$addRow <% } %></div>
      <% if ( isArray ) { %>
        <% for ( var i = 0 ; i < this.data.length ; i++ ) {
          var d = this.data[i]; %>
          <div><%= this.rowView({data: d}, this.X) %></div>
        <% } %>
      <% } else { %>
        <div id="<%= this.on('click', function() { self.addRow(); }) %>" <%= this.rowView({data: this.data}, this.X) %></div>
      <% } %>
    */}
  ],

  methods: {
    addRowToList: function(d) {
      if ( d ) this.data = Array.isArray(this.data) ? this.data.union([d]) : d;
    },
    removeRowFromList: function(d) { this.data = this.data.deleteF(d); }
  },

  actions: [
    {
      name: 'addRow',
      label: '',
      iconUrl: 'images/ic_add_24dp.png',
      action: function() {
        var view = this.AddRowView.create();
        this.stack.pushView(view);
        view.focus();
      }
    }
  ]
});