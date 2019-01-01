// let changeColor = document.getElementById('changeColor');

// chrome.storage.sync.get('color', function(data) {
//     changeColor.style.backgroundColor = data.color;
//     changeColor.setAttribute('value', data.color);
// });

// changeColor.onclick = function(element) {
//     let color = element.target.value;
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//         chrome.tabs.executeScript(
//             tabs[0].id,
//             {code: 'document.body.style.backgroundColor = "' + color + '";'});
//     });
// };


document.addEventListener('DOMContentLoaded', function() {

    chrome.storage.sync.get(['public', 'secret'], function(keys) {
        if (keys) {
            document.getElementById("publicKey").innerHTML = keys.public
        }
    })

    let button = document.getElementById("generateKey")
    button.onclick = function (element) {
        console.log("Generating")
        let userKeys = keyPair()
        console.log(userKeys.publicKey, userKeys.secretKey)
        // Set keys in chrome storage
        chrome.storage.sync.set({public: userKeys.publicKey, secret: userKeys.secretKey}, function () {
            console.log("Key Pair generated");
        })
        document.getElementById("publicKey").innerHTML = userKeys.publicKey
        
    }
})

