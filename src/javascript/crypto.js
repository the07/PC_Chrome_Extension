const convert = {
    publicKey: memoize(ed2curve.convertPublicKey),
    secretKey: memoize(ed2curve.convertSecretKey)
}

function keyPair () {
    const keyPair = nacl.sign.keyPair()
  
    return {
      secretKey: nacl.util.encodeBase64(keyPair.secretKey),
      publicKey: nacl.util.encodeBase64(keyPair.publicKey)
    }
}

function fromSecretKey (secretKey) {
    secretKey = nacl.util.decodeBase64(secretKey)

    const keyPair = nacl.sign.keyPair.fromSecretKey(secretKey)

    return {
        secretKey: nacl.util.encodeBase64(keyPair.secretKey),
        publicKey: nacl.util.encodeBase64(keyPair.publicKey)
    }
}

function encryptPublic (data, theirPublicKey, mySecretKey) {
    data = nacl.util.decodeUTF8(data)
    theirPublicKey = convert.publicKey(nacl.util.decodeBase64(theirPublicKey))
    mySecretKey = convert.secretKey(nacl.util.decodeBase64(mySecretKey))

    const nonce = nacl.randomBytes(nacl.box.nonceLength)

    data = nacl.box(data, nonce, theirPublicKey, mySecretKey)

    return {
        data: nacl.util.encodeBase64(data),
        nonce: nacl.util.encodeBase64(nonce)
    }
}

function decryptPrivate (data, nonce, theirPublicKey, mySecretKey) {
    data = nacl.util.decodeBase64(data)
    nonce = nacl.util.decodeBase64(nonce)
    theirPublicKey = convert.publicKey(nacl.util.decodeBase64(theirPublicKey))
    mySecretKey = convert.secretKey(nacl.util.decodeBase64(mySecretKey))

    data = nacl.box.open(data, nonce, theirPublicKey, mySecretKey)

    if (!data) {
        throw new Error('Failed opening nacl.box')
    }

    return nacl.util.encodeUTF8(data)
}

function signPrivate (data, mySecretKey) {
    data = nacl.util.decodeUTF8(data)
    mySecretKey = nacl.util.decodeBase64(mySecretKey)

    data = nacl.sign.detached(data, mySecretKey)

    return nacl.util.encodeBase64(data)
}

function verifyPublic (data, signature, theirPublicKey) {
    data = nacl.util.decodeUTF8(data)
    signature = nacl.util.decodeBase64(signature)
    theirPublicKey = nacl.util.decodeBase64(theirPublicKey)

    return nacl.sign.detached.verify(data, signature, theirPublicKey)
}

