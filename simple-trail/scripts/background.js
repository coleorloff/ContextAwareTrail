var currentTrail;
var localhost = 'http://sudosubdocs.herokuapp.com'
var tags = [];

chrome.runtime.onConnect.addListener(function(port) {

  console.assert(port.name == "trailpath");

    port.onMessage.addListener(function(msg) { 

      if (msg.trail == "add trail"){
        console.log("add trail" + JSON.stringify(msg.data));
        jQuery.ajax({
          url : localhost + '/api/create/trail',
          dataType : 'json',
          type : 'POST',
          // we send the data in a data object (with key/value pairs)
          data : msg.data,
          success : function(response){
              if(response.status=="OK"){
                  // success
                  // console.log('create a trail please, but seriously you promised = '+response);
                  port.postMessage({"status": "Ok"});
                  // now, clear the input fields
                  // jQuery("#addTrail input").val('');
              }
              else {
                  alert("something went wrong");
              }
          },
          error : function(err){
              // do error checking
              port.postMessage({"status": "error" });
              alert("something went wrong");
              console.error(err);
          }
        })
      }
      // prevents the form from submitting normally
      // port.postMessage({status: "Ok" }); 		
      if (msg.display == "display trail"){
      	jQuery.ajax({
            url : localhost + '/api/get/trail',
            dataType : 'json',
            success : function(response) {
                var trail = response.trail;
                // console.log("is response empty? " + jQuery.isEmptyObject({response}));  
                console.log("ajax response.trail = "+ response.trail);
                // now, render the animal image/data
                port.postMessage({"status": "Ok", res: trail});
            },
            error : function(err){
            // do error checking
              console.log("something went wrong");
              console.error(err);
            }
        });
      		console.log("display trail");
    	}
      if (msg.add == "step"){
          console.log('we are in step')
          console.log("step to add --> "+msg.data);
          jQuery.ajax({
              url : localhost + '/api/create/step',
              dataType : 'json',
              type : 'POST',
              // we send the data in a data object (with key/value pairs)
              data : msg.data,
              success : function(response){
                  if(response.status=="OK"){
                      port.postMessage({step: "step added"});
                  }
                  else {
                      alert("step went wrong in DB");
                  }
              },
              error : function(err){
                  // do error checking
                  alert("step wasn't added went wrong");
                  console.error(err);
              }
          }); 
        
      }

/////added tag search from alchemy which isn't fucking working///////
      if (msg.search == "find tags"){
          console.log('we are in search request');
          console.log("pageURL --> "+msg.data.url);
          var keywordlist = [];
          var newURL = msg.data.url;
          jQuery.ajax({
              url : 'http://gateway-a.watsonplatform.net/calls/url/URLGetRankedKeywords?apikey=909d2935c04ba8e5001c01e3c1c183d64e0de728&url='+ newURL +'&outputMode=json',
              dataType : 'json',
              success : function(response){
                  for(var i = 0; i < response.keywords.length; i++){
                      keywordlist.push(response.keywords[i].text);
                  }
                  for (var i=0;i<keywordlist.length;i++){
                      if(i<4){
                          tags = tags + keywordlist[i]+",";
                      } else { tags = tags + keywordlist[i]; }

                  }
                  console.log("tags to be searched in db --> "+tags)
                  port.postMessage({"search": "alchemy tags returned", "tags": keywordlist});
              },
              error : function(err){
                  // do error checking
                  console.log("something went wrong with alchemy");
                  console.error(err);
              } 
          });
      
  }
     if (msg.search == "search tags"){
              console.log('we are in search request');
              console.log("Tags array --> "+tags);

              jQuery.ajax({
                  url : localhost + '/api/search?tags=' + tags,
                  dataType : 'json',
                  success : function(response){
                      console.log("DB response for tags "+response);
                      port.postMessage({"search": "relevant steps returned", taggedsteps:response});
                  },
                  error : function(err){
                      // do error checking
                      alert("something went wrong");
                      console.error(err);
                  }
              });
          };

 }) });   

