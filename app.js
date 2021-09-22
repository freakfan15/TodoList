const express = require("express");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");

// *************importing date.js module from our local*************
const date = require(__dirname + "/date.js");

app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

app.set('view engine', 'ejs'); //setiing app engine as ejs

// ***********connecting app to mongoDB server*****************
// mongoose.connect("mongodb://localhost:27017/todolistDB");
mongoose.connect("mongodb+srv://admin-vivek:9gCEl99HV07H8Svu@todolist.zaeke.mongodb.net/todolistDB");

// ************Creating new Schema for storing items**************

const itemsSchema = new mongoose.Schema({
    name: String
})

const Item = new mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
})

const item2 = new Item({
    name: "Hit the + button to add a new item."
})

const item3 = new Item({
    name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3];

//**************making a new list schema to create a new list for dynamic routing*******************/
const listSchema = mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

//**************************************How to insert data in mongoDB************************************

// Item.insertMany(defaultItems, function(err){
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log("Successfully inserted default items.");
//     }
// })

//**************************************How to fetch data from mongoDB************************************
// Item.find(function(err, items){
//     if(err){
//         console.log(err);
//     }
//     else{
//         items.forEach(function(item){
//             console.log(item.name);
//         })
//     }
// });

//**************************************************************************

app.get("/", function (req, res) {
    let day = date.getDate();

    Item.find({}, function(err, foundItems){
        // console.log(foundItems);
        //***********Only Insert default items if Inserting for the first time*******************
        if(foundItems.length==0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Successfully inserted default items.");
                    res.redirect("/");
                }
            }) 
            
        }
        else{
            res.render("list", { listTitle: day, newListItems: foundItems});
        }

        
    })
    
});

app.get("/:listName", function(req, res){
    const listName = _.capitalize(req.params.listName);
    List.findOne({name: listName}, function(err, foundList){
        if(err){
            console.log(err);
        }
        else{
            if(!foundList){
                //Create a new List
                const list = new List({
                    name: listName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + listName);
            }
            else{
                //Show the foundList
                res.render("list", { listTitle: listName, newListItems: foundList.items});
            }
        }
    })
});

app.post("/", function(req, res){

    var itemName = req.body.newItem;
    var listName = req.body.list;
    let day = date.getDate();

    const item = new Item({
        name: itemName
    })


    if(listName === day){
        console.log("before saving");
        item.save();
        console.log("after saving");
        res.redirect("/");
        console.log("after redirecting");
        
    }
    else{
        List.findOne({name: listName}, function(err, foundList){
            if(!err){
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            }
        })
        
    }
});

//************************get post functions for work route when database wasn't present */

// app.get("/work", function(req, res){
//     res.render("list", {listTitle: "Work", newListItems: workItems});
// })

// app.post("/work", function(req, res ){
//     let item = req.body.newItem;
//     workItems.push(item);
//     res.redirect("/work");
// })

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === date.getDate()){
        Item.findByIdAndRemove(checkedItemId, function(err, item){
            if(err){
                console.log(err);
            }
            else{
                console.log("Removed Item: ", item);
                res.redirect("/");
            }
        })
        
    }
    else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundItem){
            if(err){
                console.log(err);
            }
            else{
                console.log("Successfully removed: ", foundItem);
                res.redirect("/" + listName);
            }
        })
        
    }
    
})

app.listen(3000, function () {
    console.log("Server started at port 3000");
})
