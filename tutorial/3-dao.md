---
layout: tutorial
permalink: /tutorial/3-dao/
tutorial: 3
---

## Controllers

At the top level of our app, we have a Controller, which is responsible for connecting the views and models together. For this simple app, we have a small Controller with very few parts. There are a couple of inputs (search box, sort order), and the data (from the `phones.js` file).

The Controller knows nothing about how the app is laid out, it just creates the different components and links them together.

- A `TextFieldView` for the search box
- A `ChoiceView` for the sort order drop-down
- A `DAOListView` for the list of phones.

Let's look into the code, which should go in a new file, `$PROJECT/Controller.js`:

    MODEL({
      name: 'Controller',
      properties: [
        {
          name: 'search',
          view: { model_: 'TextFieldView', onKeyMode: true }
        },
        {
          name: 'order',
          defaultValue: Phone.NAME,
          view: { model_: 'ChoiceView', choices: [
            [ Phone.NAME, 'Alphabetical' ],
            [ Phone.AGE,  'Newest' ]
          ] }
        },
        { name: 'dao', defaultValue: phones },
        {
          name: 'filteredDAO',
          model_: 'DAOProperty',
          view: {
            model_: 'DAOListView',
            rowView: 'PhoneCitationView',
            mode: 'read-only'
          },
          dynamicValue: function() {
            return this.dao.orderBy(this.order)
                .where(CONTAINS_IC(SEQ(Phone.NAME, Phone.SNIPPET), this.search));
          }
        }
      ]
    });

Let's explain a few pieces of this code in detail.

- `search` has its `view` set to `TextFieldView`. By default, `TextFieldView` fires updates when it loses focus or the user presses Enter. Setting `onKeyMode: true` will make it fire an update on every keystroke, meaning the list of phones will filter as you type.
- `order` defaults to sorting by `Phone.NAME`.
    - For each property `someProp` on a model `MyModel`, there is a static property spelled `MyModel.SOME_PROP` that is used for sorting and filtering in DAOs. There are several examples here.
- `order` is displayed as a `ChoiceView`, which represents a drop-down box.
    - `ChoiceView` expects an array of choices. Each choice is an array `[internalValue, 'user label']`. The value of the `order` property is implicitly two-way bound to the current value of the drop-down box.
- `dao` is the master DAO containing all the phones.
    - `phones.js` creates a global array called `phones`. We set the `defaultValue` of our `dao` property to this global value. Remember that Arrays implement the DAO interface.
- `filteredDAO` is the interesting DAO. This is the one that actually drives the main view on the page, which gets filtered by the search and ordered by the sort order.
    - Its view is `DAOListView`. This view shows a vertical list of rows, one for each entry in the DAO it is bound to. The view for each row is `PhoneCitationView`, which we'll define shortly.
    - `dynamicValue` defines a function that is run through `Events.dynamic`. `Events.dynamic` examines the function it is passed to see what its input are, and registers listeners on each of those inputs. When any of them changes, the function passed to `Events.dynamic` will be run again.
        - Here, those inputs include `this.order` and `this.search`.
        - The return value becomes the value of `this.filteredDAO`, which is a sorted and filtered version of the master `this.dao`.
    - `CONTAINS_IC` checks if the string on the left (`SEQ(Phone.NAME, Phone.SNIPPET)`) contains the string on the right (`this.search`), ignoring case.
        - `SEQ` combines its arguments all into one string.
    - More on the DAO interface can be found below.


## `DetailView` and Default Templates

The `DAOListView` above specifies a `rowView` called `PhoneCitationView`. We need to define this view, which will specify how to display a summary of a phone for the catalog page.

`DetailView` is a very important view in FOAM. It has a `data` property which is set to some modelled object. The `DetailView` has a default template, which runs through the list of `properties` on the modelled object, and displays their `name`s (or `label`s, if set) in the left column of a table, and their `view`s on the right.

Therefore we don't really have to define a custom view here, if we don't care what it looks like. To demonstrate, let's load our app using the default `DetailView` templates. Then we'll add custom templates so we get the layout and style we want.

Add these two dummy views to `Controller.js`:

    MODEL({
      name: 'PhoneCitationView',
      extendsModel: 'DetailView'
    });

    MODEL({
      name: 'ControllerView',
      extendsModel: 'DetailView'
    });

With this, the catalog page will be usable, though ugly. Update `index.html` to be the following:

    <html>
      <head>
        <script src="foam/core/bootFOAM.js"></script>
        <link rel="stylesheet" href="foam/core/foam.css" />
        <script src="Phone.js"></script>
        <script src="phones.js"></script>
        <script src="Controller.js"></script>
      </head>
      <body>
        <foam id="cat" model="Controller" view="ControllerView"></foam>
      </body>
    </html>

If you load that up in your browser, you'll see that it's not exactly pretty, but that searching and sorting work properly.

The `<foam>` tag is a convenience for loading a given model and inserting it into the DOM.

Next we'll add custom templates in [part 4](/tutorial/4-templates).

## Appendix - Details of the DAO Interface

**Feel free to skip ahead to [part 4](/tutorial/4-templates) to move on with the tutorial. This section is for those interested in the details of working with DAOs.**

The DAO interface looks like this, if you pretend Javascript supports interfaces:

    interface DAO extends Sink {
      void   put(obj, opt_sink);
      void   remove(id, opt_sink);
      void   find(query, sink);
      Future select(sink);
      Future removeAll(query, sink);
      Future update(expression);
      void   listen(sink);
      void   pipe(sink):  // select() + listen()
      void   unlisten(sink);
      DAO    where(query);
      DAO    limit(count);
      DAO    skip(count);
      DAO    orderBy(comparators...);
    }

a `Sink` looks like this:

    interface Sink {
      void put(obj);
      void remove(obj);
      void eof();
      void error(msg);
    }

Every DAO is also a sink, making it trivial to pull data from one DAO to another.

Here's an example of using the DAO interface to make a query:

    dao
      .skip(200)
      .limit(50)
      .orderBy(EMail.TIMESTAMP)
      .where(
        AND(
          EQ(EMail.TO,        'kgr@google.com'),
          EQ(EMail.FROM,      'adamvy@google.com'),
          GT(EMail.TIMESTAMP, startOfYear)))
      .select(
        GROUP_BY(EMail.SUBJECT, COUNT()));

This is generally SQL-like, but instead of parsing a string it constructs the query directly. This avoids parsing overhead, and completely avoids SQL injection. It also adds some typechecking, though Javascript can only take that so far.

This query syntax works on all DAOs, including plain Javascript arrays. It is also extensible - the `MLang` syntax - `AND`, `EQ`, and so on - are simple expressions, and you can write new ones if needed.
