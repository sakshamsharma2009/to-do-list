//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const ItemSchema = {
  name: String
};

const Item = mongoose.model("Item", ItemSchema);

const item1 = new Item({
  name: "Welcome to TO-DO-LIST"
});

const item2 = new Item({
  name: "Hit + to add items into the list"
});

const item3 = new Item({
  name: "<--- Hit this to mark the task as done."
});

const items = [item1, item2, item3];

const ListSchema = {
  name: String,
  item: [ItemSchema]
};

const List = mongoose.model("List", ListSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, fitems) {

    if (fitems.length === 0) {
      Item.insertMany(items, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Inserted items successfully!!!!");
        }
        res.redirect("/");
      });
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: fitems
      });
    }
  });
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName= req.body.list;

  const itemnew = new Item({
    name: itemName
  });

  if(listName==="Today")
  {
    itemnew.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name: listName}, function(err, foundlist){
      foundlist.item.push(itemnew);
      foundlist.save();
      res.redirect("/"+ listName);
    });
  }

});


app.get("/:customListname", function(req, res) {
  const customListname = lodash.capitalize(req.params.customListname);
  List.findOne({name: customListname}, function(err, foundlist) {
      if (err) {
        console.log(err);
      }
      else {
        if (!foundlist) {
          const list1 = new List({
            name: customListname,
            item: items
          });
          list1.save();
          res.redirect("/"+customListname);
        }
    else {
      res.render("list", {listTitle: foundlist.name, newListItems: foundlist.item});
 }
}
});
});

app.post("/delete", function(req, res) {
  const id = req.body.check;
  const lname= req.body.listName;

  if(lname==="Today")
  {

    Item.findByIdAndRemove(id, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Deleted the selected item!!!");
      }
    });
    res.redirect("/");
  }
  else
  {
    List.findOneAndUpdate({name: lname}, {$pull: {item: {_id: id}}}, function(err,foundlist){
      if(!err)
      {
        res.redirect("/"+lname);
      }
    });
  }

});

// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
//   res.redirect("/");
// });
//
// app.get("/about", function(req, res) {
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
