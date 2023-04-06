//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");


//Baoju_next 1 line removed
// const date = require(__dirname + "/date.js");

//Baoju_next 1 line added
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//Baoju_next 21 line added
mongoose.connect("mongodb+srv://BaojuWang:Test123@atlascluster.oayk5xl.mongodb.net/todolistDB2", { useNewUrlParser: true });
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];
// Item.insertMany(defaultItems)
//   .then(function(){
//     console.log("Successfully saved default items to DB.");
//   })
//   .catch(function(err){
//     console.log(err);
// });

////Baoju_next 2 lines removed
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function (req, res) {

  //Baoju_next 1 line removed
  // const day = date.getDate();

  //Baoju_next 7 line added
  Item.find({})
    .then(foundItems => {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then(function () {
            console.log("Successfully saved default items to DB.");
          })
          .catch(function (err) {
            console.log(err);
          });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }

    })
    .catch(err => {
      console.log(err);
    })
});

app.get("/:customeListName", function (req, res) {
  const customeListName = _.capitalize(req.params.customeListName);
  List.findOne({ name: customeListName })
    .then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customeListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customeListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then(function (foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch(function (err) {
        console.log(err);
      });
  }



});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
      .then(function (founcItem) {
        Item.deleteOne({ _id: checkedItemId })
      })
    res.redirect("/");
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
      .then(function (foundList) {
        res.redirect("/" + listName);
      });
  }
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
