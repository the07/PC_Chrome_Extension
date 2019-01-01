'use strict';

var keyStorage = {}

function dec2hex (dec) {
    return ('0' + dec.toString(16)).substr(-2)
}

function generateId (len) {
    var arr = new Uint8Array((len || 40) / 2)
    window.crypto.getRandomValues(arr)
    return Array.from(arr, dec2hex).join('')
}

chrome.runtime.onInstalled.addListener(function() {
    console.log('Extension installed and ready to install')
    chrome.storage.sync.get(['public', 'secret'], function(response) {
        if (response) {
            keyStorage.public = response.public,
            keyStorage.secret = response.secret
        }
    })
})

chrome.storage.onChanged.addListener(function(changes, namespace) {
    keyStorage.public = changes.public.newValue,
    keyStorage.secret = changes.secret.newValue
})

chrome.runtime.onMessageExternal.addListener (function (request, sender, sendResonse) {
    var response = {}
    
    if (request.method == "getPublicKey") {
        if (keyStorage.public) {
            response.message = "Success"
            response.data = keyStorage.public
        } else {
            response.message = "Failed"
        }
    }

    else if (request.method == "encryptRecord") {
         var aesKey = generateId(20)
         // 2 things to be encrypted - File and Private part
         response.file = CryptoJS.AES.encrypt(request.file, aesKey).toString()
         response.privateData = CryptoJS.AES.encrypt(request.privateData, aesKey).toString()

         // Encrypt the key
         response.encryptedKey = encryptPublic(aesKey, keyStorage.public, keyStorage.secret)

         // Generate hash of the data and append to the object
         var hash = sha256.create()
         hash.update(JSON.stringify(request))

         // Sign the hash
         response.userSignature = signPrivate(hash.hex(), keyStorage.secret)
         response.dataHash = hash.hex()
         response.publicKey = keyStorage.public
         response.message = "Success"
    }

    else if (request.method == "shareKey") {

        // Incoming - encryptedKey and theirPublicKey
        // First split sharedkey into data and nonce
        var sharedKey = request.encryptedKey.split('::')

        // Decrypt the key
        let decryptedKey = decryptPrivate(sharedKey[0], sharedKey[1], keyStorage.public, keyStorage.secret)
        
        // Encrypt the key using theirPublicKey
        let theirEncryptedKey = encryptPublic(decryptedKey, request.theirPublicKey, keyStorage.secret)

        response.theirEncryptedKey = theirEncryptedKey.data + "::" + theirEncryptedKey.nonce
        response.message = "Success"
    }

    else if (request.method == "signHash") {

        // Incoming - hash
        // Sign hash using the private key
        response.mySignature = signPrivate(request.hash, keyStorage.secret)
        response.message = "Success"
    }

    else if (request.method == "decryptRecord") {

        // Incoming - publicKey, encryptedKey, file, privateData
        // Split the encryptedKey into data and nonce
        var aesKeyArray = request.encryptedKey.split('::')

        // Decrypt the key
        let decryptedKey = decryptPrivate(aesKeyArray[0], aesKeyArray[1], request.publicKey, keyStorage.secret)

        // AES Decrypt the file and data
        let decryptedFile = CryptoJS.AES.decrypt(request.file, decryptedKey).toString(CryptoJS.enc.Utf8)
        let decryptedData = CryptoJS.AES.decrypt(request.data, decryptedKey).toString(CryptoJS.enc.Utf8)

        response.file = decryptedFile
        response.privateData = decryptedData
        response.message = "Success"
    }

    // else if (request.method == "test") {

    //     // Send a file and data, encrypt, decrypt and show in browser
    //     var aesKey = generateId(20)
    //     // 2 things to be encrypted - File and Private part
    //     var encryptFile = CryptoJS.AES.encrypt(request.file, aesKey).toString()
    //     var encryptData = CryptoJS.AES.encrypt(request.privateData, aesKey).toString()

    //     // decrypt both the things
    //     var decryptFile = CryptoJS.AES.decrypt(encryptFile, aesKey).toString(CryptoJS.enc.Utf8)
    //     var decryptData = CryptoJS.AES.decrypt(encryptData, aesKey).toString(CryptoJS.enc.Utf8)
        
    //     response.file = decryptFile
    //     response.data = decryptData
    //     response.message = "Success"
    // }

    else {
        response.message = "Invalid Request"
    }

    sendResonse(response) 
})