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


// chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
//     var activeTab = tabs[0]
//     console.log("send message from popup")
//     chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_button_in_popup"})
// })