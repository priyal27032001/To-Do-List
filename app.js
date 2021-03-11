//jshint esversion:6
require ("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const app = express();
const _=require("lodash");
mongoose.connect("mongodb+srv://admin-"+process.env.ADMIN+":"+process.env.PASSWORD+"@cluster0.ae0t7.mongodb.net/todolistdb?retryWrites=true&w=majority",{useNewUrlParser:true});


const listSchema=new mongoose.Schema({
  name:String
})
const thingSchema=new mongoose.Schema({
  name:String,
  itemarr:[listSchema]
})
const List=mongoose.model("list",listSchema);
const Thing=mongoose.model("thing",thingSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// creating database
const item1=new List({
  name:"Buy Food"
})
const item2=new List({
  name:"Cook Food"
})
const item3=new List({
  name:"Eat Food"
})
const itemsarray=[item1,item2,item3];

app.get("/", function(req, res) {
  //printing ListItems
  List.find(function(err,items){
    if(err) console.log(err);
    else{
      if(items.length===0){
        List.insertMany(itemsarray,function(err){
          if(err) console.log(err);
          else console.log("successfully added");
            res.redirect("/");
        })

      }
      else{
      res.render("list", {listTitle:"Today", newListItems: items});
    }}
  })




});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const newitem=new List({
    name:item
  })
  if (req.body.list === "Today") {
    newitem.save();
    res.redirect("/");
  } else {
    Thing.findOne({name:req.body.list},function(err,ans){
      if(!err){
        ans.itemarr.push(newitem);
        ans.save();//new object is not craeted. when the code is rerun the object creation reruns which create a new object and that gets saved
        //in changing something with the existing object doesnt craete a new object
        res.redirect("/"+ans.name);
      }
    })
  }
});
app.post("/delete",function(req,res){
  const del=req.body.checkbox;
  const hiddenvalue=req.body.hiddenname;
  if(hiddenvalue==="Today"){
    List.deleteOne({_id:del},function(err){
      if(err) console.log(err);
      else console.log("successfully deleted");
    });
    res.redirect("/");
  }
  else{
    Thing.findOneAndUpdate({name:hiddenvalue},
      {$pull:{itemarr:{_id:del}}},
    function(err,results){
      if(!err){
        res.redirect("/"+hiddenvalue);
      }
    })

  }

})

app.get("/:newpage", function(req,res){
  const pagename=_.capitalize(req.params.newpage);
  Thing.findOne({name:pagename},function(err,result){
    if(!err){
      if(pagename==="Favicon.ico") return;
      //  By default, your browser looks for an icon file each time you request a new page; some browsers cache this file after it's found the first time.
      //The <link rel="icon" href="LOCATION">
      // points the browser to the location of the icon file which by convention is called Favicon.ico.
      // If the href is an external URL, it will fetch the icon from that URL. If the href is a path (e.g. "Favicon.ico"),
      // then it will look inside your public folder, and if it doesn't exist in the public folder then it will be called as a
      //  GET route on /Favicon.ico. This triggers your code to add that unwanted entry to the DB.
      if(!result) {
        const thing1=new Thing({
          name:pagename,
          itemarr:itemsarray
        })
        thing1.save();
        res.redirect("/"+pagename)
      }
      else{
      res.render("list",{listTitle:result.name, newListItems: result.itemarr})
      }
    }
  })

});

app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
