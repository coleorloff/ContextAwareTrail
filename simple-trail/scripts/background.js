var currentTrail;
// var localhost = "http://localhost:3000"
var localhost = 'http://sudosubdocs.herokuapp.com'
var tags = [];
var flatChildrenArray = []

chrome.bookmarks.getTree(function(tree){
    bookmarkTree(tree);
});

function bookmarkTree(tree){
 // depthFirst(tree, 0);
    // console.log("Array of Objects = " + JSON.stringify(tree));
    // console.log("Array of Objects = " + JSON.stringify(depthFirst(tree, 0)));
    // console.log("flatChildrenArray length = "+ flatChildrenArray.length)
    console.log("bookmarks tree -----------> "+tree)
    branch = JSON.stringify(tree)
    jQuery.ajax({
        url : localhost + '/api/add/bookmarks',
        dataType : 'json',
        type : 'POST',
        // we send the data in a data object (with key/value pairs)
        data : {
            tree: branch
        },
        success : function(response){
            if(response.status=="OK"){
                console.log("data parsing ")
            }
            else {
                alert("error response from");
            }
        },
        error : function(err){
          // do error checking
            alert("something went wrong");
            console.error(err);
        }
    })
}


// function depthFirst(tree, depth){
//     var newDepth = depth
//     var branch = tree;
//     console.log("enter the depths at " + depth);
//     // check if input tree is has a url, 
//     // if it isn't then it is likely a bookmark
//     console.log(branch);
//     if(branch.url !== undefined) {
//         flatChildrenArray.push(branch)
//         console.log("pushed " + JSON.stringify(branch) + "to array")
//         console.log ("branch.url --> " + branch.url)
//         return true
//     } else {
//         // console.log("wasn't worth pushing this shit " + JSON.stringify(tree))
//         console.log("wasn't worth pushing this shit " + branch);
//     }
//     console.log("tree length " + branch.length);
//     if (branch.length == undefined) {
//         branch = tree.children
//         console.log("children length " + branch.length);
//     }
//     for (var i = 0; i < branch.length; i++){
//         console.log("step " + i)
//         if (flatChildArrayCheck(branch[i], flatChildrenArray) == "emptyarray" || branch !== undefined){
//             var currentDepth = newDepth + 1;
//             // depthFirst(tree[i],currentDepth)
//              console.log("branch[i] " + branch[i]);
//             // jQuery.when(depthFirst(tree[Object.keys(tree)[i]], currentDepth)).then(arrayReturn())
//             jQuery.when(depthFirst(branch[i], currentDepth)).then(arrayReturn())
//             console.log("lets take it to the next level --> " + currentDepth);

//         }
//     }

//     function arrayReturn(){    
//         // console.log ("tree[i] ------------------------------> " + JSON.stringify(tree[i]))
//         return flatChildrenArray
//     }   
// }

// function flatChildArrayCheck(treeElement, arrayToCheck){
//     console.log("check that array of flat children for redundancies")
//     if (arrayToCheck.length == 0){
//         console.log("emptyarray");
//         return "emptyarray"
//     }
//     for (var i = 0; i < arrayToCheck.length; i++ ){
//         if (arrayToCheck[i] == treeElement){
//             console.log("true");
//             return true;
//         } else {
//             console.log("false");
//             return false;
//         }   
//     }
// }

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

