var currentTrail;

// var localhost = "http://localhost:3000"
var localhost = 'http://sudosubdocs.herokuapp.com'
// var localhost = 'http://trailz-server.herokuapp.com'
var tags = [];
var flatChildrenArray = []
var bookmarksTreeHolder;
var folderID = "609";
var state = true;
chrome.bookmarks.getTree(function(tree){
    bookmarkTree(tree);
});
// added icon support
chrome.browserAction.onClicked.addListener(function(){
  chrome.tabs.query({
      active:true,
      lastFocusedWindow:true
  }, function(tabs){
      var tab = tabs[0]

      console.log(tabs)
      console.log(tab.url)
  })
  chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
      var activeTab = tabs[0]
      chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_button_in_popup"})
  })
})


function bookmarkTree(tree){
    // console.log("bookmarks tree -----------> ",tree)
    branch = JSON.stringify(tree)
    var bookmarksTreeHolder = tree
    folderID = findTrailzFolder(tree);
    console.log("folderID ",folderID)

 if (state){
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

}

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
                  alert("something went wrong in Add Listener Success");
              }
          },
          error : function(err){
              // do error checking
              port.postMessage({"status": "error" });
              alert("something went wrong in Add Listener Error");
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
                    console.log("ajax response.trail = ", response.trail);
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
                      // success
                      msg.data.folderID = folderID;
                      addToChrome(msg.data);
                      console.log('create a trail and bookmark please, but seriously you promised = ',response);
                      port.postMessage({"status": "Ok"});
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

          // if (msg.add == "step"){
          //     console.log('we are in step')
          //     console.log("step to add --> ", msg.data);

          // }); 
        
      // }

/////added tag search from alchemy which isn't fucking working///////
     
      if (msg.search == "add tags"){

          for (var i = 0; i < msg.data.tags.length; i++){
            tags.push(msg.data.tags[i]);
            console.log(msg.data.tags[i]);
          }
              console.log("Adding new tags = " + msg.data.tags);
              console.log(msg.data.tags);

              jQuery.ajax({
                  url : localhost + '/api/search?tags=' + tags,
                  dataType : 'json',
                  success : function(response){
                      console.log(response);
                      console.log("Tags added, new response = " + response);
                      console.log(response);
                      port.postMessage({"search": "new steps returned", "taggedsteps": response});
                  },
                  error : function(err){
                      // do error checking
                      alert("something went wrong in Seach Tags Error");
                      console.error(err);
                  }
              });
          };

          /////working on removing tags

       if (msg.search == "remove tags"){
          console.log(msg.data.tags);

          for (var i = 0; i < msg.data.tags.length; i++){
            console.log(msg.data.tags.indexOf(msg.data.tags[i]));
            tags.splice(tags.indexOf(msg.data.tags[i]), 1);
          }
              console.log("Removing tags = " + msg.data.tags)

              jQuery.ajax({
                  url : localhost + '/api/search?tags=' + tags,
                  dataType : 'json',
                  success : function(response){
                      console.log(response);
                      console.log("Tags added, new response = " + response);
                      console.log(response);
                      port.postMessage({"search": "revised steps returned", "taggedsteps": response});
                  },
                  error : function(err){
                      // do error checking
                      alert("something went wrong in Seach Tags Error");
                      console.error(err);
                  }
              });
          };


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
                  // for (var i=0;i<keywordlist.length;i++){
                  //     if(i<4){
                  //         tags = tags + keywordlist[i]+",";
                  //     } else { tags = tags + keywordlist[i]; }

                  // }   
                 tags = keywordlist;

                  
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

  // ask cole why he got rig of the keywordlist to tags 
  //->dunno...maybe this is why the number of tags we're returning is limited?????
      //     if (msg.search == "find tags"){
      //         // console.log('we are in search request');
      //         // console.log("pageURL --> "+msg.data.url);
      //         var keywordlist = [];
      //         var newURL = msg.data.url;
      //         jQuery.ajax({
      //             url : 'http://gateway-a.watsonplatform.net/calls/url/URLGetRankedKeywords?apikey=909d2935c04ba8e5001c01e3c1c183d64e0de728&url='+ newURL +'&outputMode=json',
      //             dataType : 'json',
      //             success : function(response){
      //                 for(var i = 0; i < response.keywords.length; i++){
      //                     keywordlist.push(response.keywords[i].text);
      //                 }
      //                 for (var i=0;i<keywordlist.length;i++){
      //                     if(i<4){
      //                         tags = tags + keywordlist[i]+",";
      //                     } else { tags = tags + keywordlist[i]; }

      //                 }
      //                 console.log("tags to be searched in db --> ",tags)
      //                 port.postMessage({"search": "alchemy tags returned", "tags": keywordlist});
      //             },
      //             error : function(err){
      //                 // do error checking
      //                 console.log("something went wrong with alchemy");
      //                 console.error(err);
      //             } 
      //         });
          
      // }

      //I think this is broken
//      if (msg.search == "search tags"){
//               console.log('we are in search request');
//               console.log("Tags array --> "+tags);
//               jQuery.ajax({
//                   url : localhost + '/api/create/step',
//                   dataType : 'json',
//                   type : 'POST',
//                   // we send the data in a data object (with key/value pairs)
//                   data : msg.data,
//                   success : function(response){
//                       if(response.status=="OK"){
//                           port.postMessage({step: "step added"});
//                       }
//                       else {
//                           alert("step went wrong in DB");
//                       }
//                   },
//                   error : function(err){
//                       // do error checking
//                       alert("step wasn't added went wrong");
// =======
//                       console.log("DB response for tags " + response);
//                       console.log(err);
//                       port.postMessage({"search": "relevant steps returned", "taggedsteps": response});
//                   },
//               }); 
            
//           }
         if (msg.search == "search tags"){
                  console.log('we are in search request');
                  console.log("Tags array --> "+tags);

                  jQuery.ajax({
                      url : localhost + '/api/search?tags=' + tags,
                      dataType : 'json',
                      success : function(response){
                          console.log("DB response for tags ",response);
                          port.postMessage({"search": "relevant steps returned", taggedsteps:response});
                      },
                      error : function(err){
                          // do error checking
                          alert("something went wrong");
                          console.error(err);
                      }
                  });
              };
 }) 
});   
// this function adds a new bookmark to chrome when a new trail
// is added, however it requires a specific Trail id
function addToChrome(data){
   
    var newMark = {
        parentId: data.folderID,
        title: data.title,
        url: data.url
    };
    console.log("addToChrome Boooy ", newMark);

    chrome.bookmarks.create(newMark)
 }
function findTrailzFolder(tree){
    console.log("someone wants that Trailz folder")
    var sub = tree[0].children[0].children;
    // console.log("sub.id = ", tree[0].children[0].id)
    var count = 0
    
    for (var  i = 0; i < sub.length; i++ ){
        console.log("sub.length = ", sub.length)
        if (sub[i].title == "Trailz"){
            console.log("Found --> ", sub[i].title)
            return sub[i].id
        } else {
            count++
            // tree[0].children[0].id
            if (count == sub.length){
                var data = {
                    parentId: "1",
                    title: "Trailz",
                    url: ""
                }
                // uncommented this because its not ready yet
                addToChrome(data)
                chrome.bookmarks.getTree(function(marks){
                    console.log("marks",marks)
                    if (state) {findTrailzFolder(marks); state = false;}
                    
                });
                
            }

        }
    }

}
