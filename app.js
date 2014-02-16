var express = require('express');
var app = express();
var path = require('path')
var cronJob = require('cron').CronJob;
var ObjectID = require('mongodb').ObjectID;
var validation = require('validator');
var email   = require("emailjs/email");

var dbURL = "nodeapps";
var collections = ["notes"];
var db = require("mongojs").connect(dbURL,collections);

function noteType(userid,note){
	this.userid = userid;
	this.note = note;
	this.reminderDate;
}

new cronJob('00 00 * * *', function(){
    var tod = new Date();

    var formattedDay = (tod.getUTCDate());
    if(formattedDay<10){
    	formattedDay="0" + formattedDay +"";
    }

    var formattedMonth = (tod.getUTCMonth()+1);
    if(formattedMonth<10){
    	formattedMonth="0" + formattedMonth +"";
    }

    var formatted = formattedMonth.concat(('/'),(formattedDay+'/'),tod.getUTCFullYear());
    db.notes.find({reminderDate: formatted}, function(err, note) {
    	//Email with emailjs
    });

}, null, true, "Europe/London GMT");

function validateNote(newNote){
var errors=new Array();
var isValid=true;

if (newNote.reminderDate.trim().length>0)
	{
		isValid = validation.isValidDate(newNote.reminderDate);
		if (!isValid )
		{
			errors[errors.length] = "Invalid Date Format";
		}
	}

 	if(newNote.note.trim().length<=0)
 	{
 		isValid = false;
 		errors[errors.length] = "Notes cannot be empty";
 	}
 	return errors;
}

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



app.get(('/delete/:mnid') ,function(req,res){
	
	var thisNoteID = req.params.mnid;
	var objID = new ObjectID(thisNoteID);

	db.notes.remove({_id: objID}, function(err, note) {
	});
	res.redirect('/');
});

app.post(('/edit/:mnid') ,function(req,res){
	var thisNoteID = req.params.mnid;
	var objID = new ObjectID(thisNoteID);
	var newNote = {userid : 1,_id:objID, note:req.param('note'),reminderDate:req.param('reminderDate')};
	var saveSuccess = false;
 	var errors=new Array(); 
 	errors = validateNote(newNote);

	if(errors.length<=0)
	{
		db.notes.update({_id:ObjectID},{$set:{note:req.param('note'),reminderDate:req.param('reminderDate')}}, 
			function(err, saved) {
	  		if( err || !saved ) {

	  		}else {
  				saveSuccess = true;
	  			res.redirect('/');
	  		};
		});	
	}else{
		res.render('edit', {
			title: 'NodePad',
			pageErrors:errors,
			retrievedNote:newNote
		});
	}
});


app.get(('/edit/:mnid') ,function(req,res){
	
	var thisNoteID = req.params.mnid;
	var objID = new ObjectID(thisNoteID);

	db.notes.findOne({_id: objID}, function(err, note) {
		if(note.reminderDate == undefined)
		{
			note.reminderDate = '';
		}

		var errors=new Array(); 
		res.render('edit', {
	    		title: 'NodePad',
	    		pageErrors:errors,
	    		retrievedNote:note
			});
	});

});

app.get('/new',function(req,res){
	var errors=new Array(); 
	res.render('new', {
		title: 'NodePad',
		pageErrors:errors
	});
});

app.post('/new',function(req,res){

	var newNote = {userid : 1, note:req.param('note'),reminderDate:req.param('reminderDate')};
	var saveSuccess = false;
 	var errors=new Array(); 
 	errors = validateNote(newNote);

	if(errors.length<=0)
	{
		db.notes.save(newNote, function(err, saved) {
	  		if( err || !saved ) {

	  		}else {
  				saveSuccess = true;
	  			res.redirect('/');
	  		};
		});	
	}else{
		
		res.render('new', {
			title: 'NodePad',
			pageErrors:errors
		});
	}
});

try{
	app.listen(3030);	
} catch(err){console.log(err);}

