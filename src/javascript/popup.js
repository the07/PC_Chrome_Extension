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
            document.getElementById("privateKey").value = keys.secret
        }
    })

    function setKeys (userKeys) {
        chrome.storage.sync.set({public: userKeys.publicKey, secret: userKeys.secretKey}, function () {
            console.log("Key Pair generated");
        })
        document.getElementById("publicKey").innerHTML = userKeys.publicKey
        document.getElementById("privateKey").value = userKeys.secretKey
    }

    let button = document.getElementById("generateKey")
    button.onclick = function (element) {
        console.log("Generating")
        let userKeys = keyPair()
        
        setKeys(userKeys)
    }

    let rebutton = document.getElementById('loadKeyPair')
    rebutton.onclick = function (element) {
        let secretKey = document.getElementById("loadKeyPairPrivate").value
        let userKeys = fromSecretKey(secretKey)
        document.getElementById("loadKeyPairPrivate").value = ''
        setKeys(userKeys)
    }

    let copyButton = document.getElementById('copyKeyPair')
    copyButton.onclick = function (element) {
        let privateKey = document.getElementById("privateKey") 
        privateKey.focus()
        privateKey.select()
        try {
            var successful = document.execCommand("copy");
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);
        } catch (err) {
            console.log('Oops, unable to copy');
        }
    }

    let clearButton = document.getElementById('clearKeys')
    clearButton.onclick = function (element) {
        let userKeys = {
            publicKey: '',
            secretKey: ''
        }
        setKeys(userKeys)
    }
})

