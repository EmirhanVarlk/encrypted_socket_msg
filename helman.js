function prime_checker(num) { //asal mı
    if (num <= 1) return false; // negatives
    if (num % 2 == 0 && num > 2) return false; // even numbers
    const s = Math.sqrt(num); // store the square to loop faster
    for(let i = 3; i <= s; i += 2) { // start from 3, stop at the square, increment in twos
    if(num % i === 0) return false; // modulo shows a divisor was found
  }
  return true;
}

function primitive_check(g, p) {  //aralarında asal mı
    let L=[]
    for (var i = 1; i < p; i++) {
        L.push(Math.pow(g, i) % p);
    }

    for (var i = 1; i < p; i++) {
        if (L.indexOf(i) > -1) {
            L = [];
            return -1;
        }

        return 1;
    }
}


function gen_P(){
    return 23;
    let P;
    do{
        P=Math.floor(Math.random() * 1000);
    }while(prime_checker(P)==false);
    return P;
}


function gen_G(P){
    return 9;
    let G;
    do{
        G=Math.floor(Math.random() * 1000);
    }while(primitive_check(P,G)==-1);
    return G;
}

function encode(data, key) {
    let cleartext = data;
    key = ""+key;
    let reps = Math.floor((cleartext.length - 1) / key.length) + 1;
    let a1 = new TextEncoder().encode(cleartext);
    key = (key.repeat(reps)).substring(0, cleartext.length);
    key = new TextEncoder().encode(key);
    let cipher = new Uint8Array(a1.length);
    for (let i = 0; i < a1.length; i++) {
        cipher[i] = a1[i] ^ key[i];
    }
    return cipher;
}

function decode(data, key) {
    key = ""+key;
    let cipher = data;
    console.log(cipher);
    let reps = Math.floor((cipher.length - 1) / key.length) + 1;
    key = (key.repeat(reps)).substring(0, cipher.length);
    key = new TextEncoder().encode(key);
    let clear = new Uint8Array(cipher.length);
    for (let i = 0; i < cipher.length; i++) {
        clear[i] = cipher[i] ^ key[i];
    }
    return new TextDecoder().decode(clear);
}



module.exports={ gen_P, gen_G, encode, decode }