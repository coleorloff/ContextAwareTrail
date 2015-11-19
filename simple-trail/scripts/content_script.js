//------------------DOC READY-------------------//
var site;
var port = chrome.runtime.connect({name: "trailpath"});
var currentTrail;
var open = false;
var first = true;

// Talking to POPUP.js // This is popping open and closing the Trailz div in your window from the extension icon
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.message == "clicked_button_in_popup" && first && !open) {
            loadEx();
            displayTrail();
            first = !first;
            open = !open;
            console.log(open);
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

});

function loadEx(){
    var host = window.location.hostname;
    var pageBody = $(document.body);
    var pageURL = window.location.href;   
    
    console.log("pageURL =" + pageURL) 
    console.log('hostname -->' + host)
    getTags(pageURL);

    $('<div id="trailex" class="container">'+'</div>').prependTo(pageBody);
    $('<div class="holder" id="trail-holder">'+'</div>').appendTo('.container');
        var htmlToAdd = 
            '<div class="menu" id="main">'+
            '<h1> MAIN MENUISH THING</h1>'+
            '<div class="btn-group">'+
            '<button type="button" class="btn btn-default" role="group" id="display-trail">Display Trail</button>'+
            '<button type="button" class="btn btn-default" role="group" id="add-trail">Add Trail</button>'+
            '<button type="button" class="btn btn-default" role="group" id="add-step">Add Step</button>'+
            '</div>'+
            '</div>';

    jQuery('.container').prepend(htmlToAdd);
}

function displayTrail(){
    port.postMessage({"display": "display trail"});
    port.onMessage.addListener(function(msg) {
        if (msg.status == "Ok"){
            console.log ("status returned success on returned to server");
            console.log ("now render msg.response --> "+ msg.res);
            renderTrail(msg.res);
        }
      else if (msg.question == "Madame who?")
        port.postMessage({"answer": "Madame... Bovary"});
    });
}

function renderTrail(trails){

    var htmlToAdd = "";
           
    jQuery('.container').append(htmlToAdd);

    // first, make sure the #animal-holder is empty
    jQuery('#trail-holder').empty();

    // loop through all the steps and add them in the animal-holder div
    for(var i=0;i<trails.length;i++){
        var stepsInTrail = '';
        for(var j=0;j<trails[i].steps.length;j++){
            stepsInTrail += 
            '<div class="step-holder">'+
                '<div class="panel panel-default">'+
                    '<div class="panel-heading">'+trails[i].title+'</div>'+
                        '<div class="panel-body>'+
                            '<ul class="list-group">'+
                                '<li class="list-group-item" id="step-title"> Title: '+trails[i].steps[j].title+'</span></li>'+
                                '<li class="list-group-item" id="text"> Saved Text: '+trails[i].steps[j].text+'</span></li>'+
                                '<li class="list-group-item" id="url URL: ">'+trails[i].steps[j].url+'</span></li>'+
                                '<li class="list-group-item" id="tags">'+colorTags(trails[i].steps[j].tags)+'</span></li>'+
                                '<li class="hide list-group-item" id="hide id"> ID: '+trails[i].steps[j]._id+'</li>'+
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
    trackTrailId(trails);
}

function toggleContainer(){
   $('.container').toggleClass('toggled');
}

function toggleTrail(){
    $('body').on('click', '#display-trail', function(e){
        $('.holder').toggleClass('hidden')
    });
};

$('body').on('click', '#add-trail', function(e){
    console.log('submitting once');
    var pageURL = window.location.href; 
    var host = window.location.hostname;
    // first, let's pull out all the values
    // the name form field value
    // var text = jQuery("#text").val();
    var data = {
        trailTitle: "First Trail",
        title: host,
        text: "text",
        url: pageURL,
        tags: "tags"
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

    var data = {
        trailId: currentTrail,
        title: "step-title",
        text: "step-text",
        tags: "step-tags",
        url: "step-url"   
    };

    console.log("Object to be created in the DB = " + JSON.stringify(data));

   
                // jQuery("#addStep input").val('');
                // jQuery("#addStep").hide();
                // jQuery("#step-submit").hide();
                // renderTrailMap();
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
    // var pageURL = window.location.href;  
    var data = {
        trailId: currentTrail,
        title: "step-title",
        text: "step-text",
        tags: "step-tags",
        url:  url
    };

    console.log("get tags data: " + data);
 port.postMessage({"search": "find tags", "data": data});
    port.onMessage.addListener(function(msg) {
        if (msg.search == "alchemy tags returned"){
            // console.log (msg.search);
            console.log ("tags returned to content script from alchemy -->" + msg.tags)
            port.postMessage({"search": "search tags"});
            console.log("in the search for DB tags");
        }
        if (msg.search == "relevant steps returned"){
            console.log("awesome we got tags!"+msg.taggedsteps)
        }
    });
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
    

        $('#tags').append('<span class="label label-success">'+tags+'</span>')

    console.log(tags);
};




















