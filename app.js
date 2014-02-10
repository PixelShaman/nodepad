var express = require('express');
var app = express();
var path = require('path')
var cronJob = require('cron').CronJob;


var dbURL = "nodeapps";
var collections = ["notes"];
var db = require("mongojs").connect(dbURL,collections);

console.log("started");

function noteType(userid,note){
	this.userid = userid;
	this.note = note;
	this.reminderDate;
}


new cronJob('28 21 * * *', function(){
    var tod = new Date();
    console.log(tod);
}, null, true, "Europe/London GMT");

app.configure(function(){
  app.set('port', process.env.PORT || 3030);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout: false});
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});



app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


app.get('/',function(req,res){
	db.notes.find().toArray(function(err,notes){
		res.render('index', {
	    		title: 'NodePad',
	    		entries:notes
			});
	  });
});

app.get('/new',function(req,res){
	db.notes.find().toArray(function(err,notes){
		res.render('new', {
	    		title: 'NodePad',
	    		entries:notes,
	    		other:notes.length
			});
	  });
});

app.post('/new',function(req,res){

	var newNote = {userid : 1, note:req.param('note'),reminderDate:req.param('reminderDate')};

	db.notes.save(newNote, function(err, saved) {
  		if( err || !saved ) {
  			//not saved
  		}else {
  			res.send('{"Message" : "User Saved"}');
  		};
	});

});


/****************API****************/

app.get('/api/allNotes', function(req, res){

	db.notes.find().toArray(function(err,notes){
		res.end(JSON.stringify(notes));
  	});
}); // End App Get



app.post('/api/findNote', function(req, res) 
{

	var firstName = req.body.first + "";

	if(res.headerSent == false)
	{
		res.setHeader("Content-Type", "application/json"); //Solution!
		res.writeHead(200);	
	}

	db.notes.find({first:firstName},function(err,notes)
	{
		var mongCount = 0;
		console.log(notes);
		if( err || !notes) 
		{
			//nothing found
		}
  		else notes.forEach( function(item) 
  		{
    		mongCount ++;
    		res.send(JSON.stringify(notes));
    		
      	});
			
			if(mongCount == 0 )
			{
				res.send('[{Error : "0 found"}]');	    		
			}
	});
		
});

app.put("/api/newNote",function(req,res){
	var item = req.body;

	db.notes.save(item, function(err, saved) {
  		if( err || !saved ) console.log("User not saved");

  		else res.send('{"Message" : "User Saved"}');
	});
});

try{
	app.listen(3030);	
} catch(err){console.log(err);}

