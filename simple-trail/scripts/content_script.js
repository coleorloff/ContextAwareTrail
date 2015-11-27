//------------------DOC READY-------------------//
var site;
var port = chrome.runtime.connect({name: "trailpath"});
var currentTrail;
var open = false;
var first = true;
var tagString;

// Talking to POPUP.js // This is popping open and closing the Trailz div in your window from the extension icon
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.message == "clicked_button_in_popup" && first && !open) {
            loadEx();
            displayTrail();
            first = !first;
            open = !open;
        } else if (request.message == "clicked_button_in_popup"){
            toggleContainer();
            open = !open;
            if (!open){
                console.log("hiding the stash!");
            } else if (open) {
                console.log("opening your drawer, sir");
            }
        } else {
            toggleContainer();
            console.log("hiding the stash");
            open = !open;

        }
        chrome.runtime.sendMessage({"message":"open_new_tab"})
})

///MAIN DOCUMENT FUNCTION////
$(document).ready(function(){
    toggleTrail();
    plusOne();
});

function loadEx(){
    var host = window.location.hostname;
    var pageBody = $(document.body);
    var pageURL = window.location.href;   
    
    console.log("pageURL =" + pageURL) 
    console.log('hostname -->' + host)
    getTags(pageURL);

    $('<div class="container" id="trailex" >'+'</div>').prependTo(pageBody);
    $('<div class="holder" id="trail-holder">'+'</div>').appendTo('#trailex');
        var htmlToAdd = 
            '<div class="menu" id="main">'+
                    '<h1> Az </h1>'+
                        '<div class="btn-group btn-group-xs">'+
                            '<button type="button" class="btn btn-default" role="group" id="display-trail">Display Trail</button>'+
                            //creates new "trail" in db, i.e. saves current page with relevent information
                            //should this become a secondary action??
                            '<button type="button" class="btn btn-default" role="group" id="add-trail">Add Current Page</button>'+
                            //should be permenently removed. "steps" no longer exist, as there will not be child-nodes/pages in this view.
                            //'<button type="button" class="btn btn-default" role="group" id="add-step">Add Step</button>'+
                        '</div>'+
            '</div>'+
                '<div id="tagTicker">'+
                    '<div class="panel panel-default" id="tag-stream">'+
                        '<span class="label label-one">Tags will</span>'+
                        '<span class="label label-two">go</span>'+
                        '<span class="label label-three">here</span>'+
                        '<span class="label label-four">here</span>'+
                        '<span class="label label-five">here</span>'+
                        '<span class="label label-six" id="add-tag">+</span>'+
                    '</div>'+
            '</div>';

    jQuery('#trailex').prepend(htmlToAdd);
}

function displayTrail(){
    port.postMessage({"display": "display trail"});
    port.onMessage.addListener(function(msg) {
        if (msg.status == "Ok"){
            console.log ("status returned success on returned to server");
            console.log ("now render msg.response --> "+ JSON.stringify(msg.res));
            trackTrailId(msg.res);
            //this render all the "trails"
            //they get rendered a second time in getTags()
            //that time only the trailz with matching tags are rendered
            //so we might want to create a seperate function that takes any set of trailz to display.
            //renderTrail(msg.res);
        }
      else if (msg.question == "Madame who?")
        port.postMessage({"answer": "Madame... Bovary"});
    });
}

function renderTrail(trails){
    // trackTrailId(trails);
    var htmlToAdd = "";    
    jQuery('.trailex').append(htmlToAdd);

    // first, make sure the #animal-holder is empty
    //...but maybe not. this was causing the trail-holder div to appear on 
    //open and then immediately and irreversibly disappear. 
    jQuery('#trail-holder').empty();

    // loop through all the steps and add them in the animal-holder div
    for(var i=0;i<trails.length;i++){
        var stepsInTrail = '';
        for(var j=0;j<trails[i].steps.length;j++){
            stepsInTrail += 
            '<div class="step-holder">'+
                '<div class="panel panel-default">'+
                ///replaced "trail" title with "step"-title
                //although technically, we are still displaying a "trail" here.
                //it just has one "step" in it and that is what's being displayed.
                    '<div class="panel-heading"><a href="'+trails[i].steps[j].url+'">'+trails[i].steps[j].title+'</a></div>'+
                        '<div class="panel-body>'+
                            '<ul class="list-group">'+
                                '<li class="list-group-item" id="text"> Notes: '+trails[i].steps[j].text+'</span></li>'+
                                //needs some function that takes an array of tags
                                //and puts each tag into a random label type
                                '<li class="list-group-item" id="text"> Tags: '+colorTags(trails[i].steps[j].tags)+'</span></li>'+
                                //'<li class="list-group-item" id="hide url"> URL:'+trails[i].steps[j].url+'</span></li>'+
                                //'<li class="hide list-group-item" id="hide id"> ID: '+trails[i].steps[j]._id+'</li>'+
                            '</div>'
                        '<div class="btn-group">'+
                            '<button type="button" class="btn btn-group" id="'+trails[i]._id+'" onclick="trackTrailId(event)">Add Step</button>'+
                            '<button type="button" class="btn btn-group" id="'+trails[i]._id+'" onclick="deleteStep(event)">Delete Trail</button>'+
                            '<button type="button" class="btn btn-group" data-toggle="modal" data-target="#editModal"">Edit Step</button>'+
                        '</div>'+
                '</div>'+
            '</div>';
            
        }
        jQuery('#trail-holder').append(stepsInTrail);
    } 
}

//on Browser Action button click --> opens the extension in the window
function toggleContainer(){
   $('#trailex').toggleClass('toggled');
}
//on "display trail" button click --> toggles the trail open/closed
function toggleTrail(){
    $('body').on('click', '#display-trail', function(e){
        $('.holder').toggleClass('hidden')
    });
};
//adds a new label to the list of tags
function plusOne(){
    $('body').on('click', '#add-tag', function(e){
        $('#tag-stream').append('<span class="label label-ten">NEW!</span>')
    });
}

$('body').on('click', '#add-trail', function(e){
    console.log('submitting once');
    var pageURL = window.location.href; 
    var host = window.location.hostname;
    var title = $(document).find("title").text();
    // first, let's pull out all the values
    // the name form field value
    // var text = jQuery("#text").val();
    var data = {
        trailTitle: "First Trail",
        title: title,
        text: "text",
        url: pageURL,
        tags: tagString
    };

    console.log("Object to be created in the DB = " + JSON.stringify(data));
      // prevents the form from submitting normally
      e.preventDefault();
      addTrail(data);
      return false;
});

function addTrail(data){
    port.postMessage({"trail": "add trail", "data": data});
    port.onMessage.addListener(function(msg) {
        if (msg.status == "Ok"){
            console.log ("status returned success on posting to server");
            port.postMessage(
                {request: "thanks"}
                );
            console.log("in content");
        }
      else if (msg.question == "Madame who?")
        port.postMessage({"answer": "Madame... Bovary"});
    });
}

$('body').on('click', '#add-step', function(e){
    console.log('addStep submitting once');
    // first, let's pull out all the values
    // the name form field value

    var pageURL = window.location.href; 
    var title = $(document).find("title").text();

    var data = {
        trailId: currentTrail,
        title: title,
        text: "step-text",
        tags: tagString,
        url: pageURL   
    };

    console.log("Step to be created in the DB = " + JSON.stringify(data));

      addStep(data);   
      e.preventDefault();
      return false;
});

function addStep(data){
    port.postMessage({"add": "step", "data": data});
    port.onMessage.addListener(function(msg) {
        if (msg.step == "step added"){
            console.log ("step added to server");
            port.postMessage(
                {request: "thanks"}
                );
            console.log("in content");
        }
      else if (msg.question == "Madame who?")
        port.postMessage({"answer": "Madame... Bovary"});
    });
}

//Not sure where this is called yet 
function renderSteps(steps){

    // first, make sure the #animal-holder is empty
    jQuery('#step-holder').empty();

        // loop through all the steps and add them in the animal-holder div
        for(var i=0;i<steps.length;i++){
            var htmlToAdd = '<div class="col-md-4 step">'+
                '<h1 class="title">'+steps[i].title+'</h1>'+
                '<ul>'+
                    '<li>Saved Text: <span class="text">'+steps[i].text+'</span></li>'+
                    '<li>URL: <span class="note">'+steps[i].url+'</span></li>'+
                    '<li>Tags: <span class="tags">'+steps[i].tags+'</span></li>'+
                    '<li class="hide id">'+steps[i]._id+'</li>'+
                '</ul>'+
                '<button type="button" id="'+steps[i]._id+'" onclick="deleteStep(event)">Delete Step</button>'+
                '<button type="button" data-toggle="modal" data-target="#editModal"">Edit Step</button>'+
            '</div>';

            jQuery('#step-holder').prepend(htmlToAdd);

    }
}

// after the display function has been called render the response from the background script to the page
// This is where the trails are injected into the page
function getTags(url){
    console.log("get tags fired");
    //var pageURL = window.location.href;  

    var data = {
        trailId: currentTrail,
        title: "step-title",
        text: "step-text",
        tags: "step-tags",
        url:  url
    };

    port.postMessage({"search": "find tags", "data": data});

    port.onMessage.addListener(function(msg) {
        if (msg.search == "alchemy tags returned"){
            // console.log (msg.search);
            console.log ("tags returned to content script from alchemy -->" + msg.tags)
            tagsToString(msg.tags);

            port.postMessage({"search": "search tags"});
            console.log("in the search for DB tags");
        }
        if (msg.search == "relevant steps returned"){
            console.log("awesome we got tags!" + msg.taggedsteps);
            console.log(msg.taggedsteps);

            //this is where the magic happens
            //trails with matching tags get displayed
            renderTrail(msg.taggedsteps);
        }
    });
}

function tagsToString(array){
   
    for (var i = 0 ; i< array.length; i++){
        tagString = tagString + array[i] +","
    }
}

function trackTrailId(trails){
    console.log('the main trail id to add a step to is ' + trails[0]._id);
    console.log('This is from the content script');
    currentTrail = trails[0]._id;

    // currentTrail = event.target.id;
}

function saveText(e){
    console.log('this is where you save some text')
    e.preventDefault();
}

function colorTags(tags){
    var colors = ['label-one', 'label-two', 'label-three', 'label-four', 'label-five', 'label-six', 'label-seven', 'label-eight', 'label-nine', 'label-ten'];
    var wrappedTags = [];
    //for each tag
    //make tag a label
    //add a random label type to it

    for (var i = 0; i < tags.length; i ++){
       wrappedTags.push('<span class ="label label-success">'+tags[i]+'</span>');
    }

    return wrappedTags;
   
};

//trails[i].steps[j].tags
//'<span class="label label-two">go</span>'+





















