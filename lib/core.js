/*
IPverter API 
-------
A very small tool for make mixed representation of a same IP address 
in order to evade some anti-SSRF protection.
-------
@author: FrenchYeti
@date : 13/07/2017
*/
var IPverter = {
    CIDR: 1,
    DOTTED: 2,

    // arbitrary padding (number max of 0 before the value)
    MAX_PADDING_DECIMAL: 4,

    LONG: 'l',
    INTEGER: 'i',
    DECIMAL: 'd',
    BINARY: 'b',
    HEXADECIMAL: 'h',
    OCTAL: 'o',
    BASE: { 'b':2, 'o':8, 'd':10, 'h':16 },
    
    Opts: {
        longExpr: false,
        regular: false,
        smart: false,
        extraPadding: false
    },
};
var $=IPverter;


// convert IP chunks
function ipTo(base, ip){
    if($.BASE[base]!=null){
        for(let i in ip.parts) 
            ip.parts[i][base] = ip.parts[i][$.DECIMAL].toString($.BASE[base]);
    }else if(base == $.LONG){
        ip.long = (ip.parts.p1.d*Math.pow(256,3))+(ip.parts.p2.d*Math.pow(256,2))+(ip.parts.p3.d*256)+ip.parts.p4.d;
    }
};


// split an IP into a 4-uplet of integer
function parseSingleIP(str){
    let p=str.split('.'), ip={};
/*
    ip.parts = {
        p1: { d:parseInt(p[0],10) }, 
        p2: { d:parseInt(p[1],10) }, 
        p3: { d:parseInt(p[2],10) }, 
        p4: { d:parseInt(p[3],10) }
    };        
*/    
    ip.parts = [
        { d:parseInt(p[0],10) }, 
        { d:parseInt(p[1],10) }, 
        { d:parseInt(p[2],10) }, 
        { d:parseInt(p[3],10) }
    ];

    return ip;
};


// parse the IP and detect CIDR notation
function parseIP(str){
    let re=new RegExp('^([0-2]?[0-9]?[0-9]\.[0-2]?[0-9]?[0-9]\.[0-2]?[0-9]?[0-9]\.[0-2]?[0-9]?[0-9])/?(0?[0-9]|[12][0-9]|3[0-2])?$','g');
    let ips=[];    
    let matches = re.exec(str);

    if(matches == null)  return false;
    
    // detect CIDR notation
    let subject = {ip: matches[1], mask: parseInt(matches[2]|0) };

    // if mask < 32, generate IPs 
    if(subject.mask == 0){
        ips.push(parseSingleIP(subject.ip));        
    }
    else{
        subject._ip = parseSingleIP(subject.ip);
        console.log("[!] Sorry, CIDR notation is not yet supported.");
 
        // cast each part of IP to binary        
        /*ipTo($.BINARY, subject._ip);

        let i=0, ip, o;
        do{
            
            ip = subject._ip        
        }
        while(32-i > subject.mask)*/ 
    }        
    
    return ips;
}


// API

$.addOptLong = ()=>{ $.Opts.longExpr=true };
$.addOptRegular = ()=>{ $.Opts.regular=true };
$.addOptSmart = ()=>{ $.Opts.smart=true };
$.addOptPadding = ()=>{ $.Opts.extraPadding=true };


var Format = {
    // octal notation 
    'o': {
        getPaddingRange: function(chunk){
            return 4-chunk.toString().length;
        },
        prepareChunk: function(chunk,padding){
            if(chunk.length<3)
               return chunk = '0'.repeat(padding)+chunk;
            else
               return '0'.repeat($.Opts.extraPadding? padding : 0)+'0'+chunk;
        }
    },
    // dotted decimal notation
    'd': {
        getPaddingRange: function(chunk){
            // There is a max of 3 numeric characters in the decimal value
            return 3-chunk.toString().length;  
        },
        prepareChunk: function(chunk,padding){
            return '0'.repeat($.Opts.extraPadding? padding : 0)+chunk;
        }
    },
    'h': {
        getPaddingRange: function(chunk){
            return 4-chunk.toString().length;  
        },
        prepareChunk: function(chunk,padding){
            return '0x'+'0'.repeat($.Opts.extraPadding? padding : 0)+chunk;
        }
    },
    'b': {
        getPaddingRange: function(chunk){
            return 8-chunk.toString().length;  
        },
        prepareChunk: function(chunk,padding){
            return '0'.repeat(padding)+chunk;
        }
    }
};

// generate each notation of each parts
function prepareChunks(ip){
    
    let maxPadding, v;

    // convert each chunk into other base
    ipTo($.BINARY, ip);
    ipTo($.OCTAL, ip);
    ipTo($.HEXADECIMAL, ip);

    // generate all valid values for each chunks
    ip.ranges = [];    
    for(let p in ip.parts){
        // compute the notation for each part and each padding
        ip.ranges[p] = [];
        for(let b in Format){
            maxPadding = Format[b].getPaddingRange(ip.parts[p][b]);
            // make a value with each padding
            for(let k=0; k<=maxPadding; k++){
                v = Format[b].prepareChunk(ip.parts[p][b], k);
                if(ip.ranges[p].indexOf(v)==-1) ip.ranges[p].push(v);
            }
        }
    }   
}

function generatePayloadsFor(ip, payloads){
    let ipv ;

    // add long notation to the list
    if($.Opts.longExpr) ips.push($.intIP);

    // prepare the range of value for each IP chunk
    prepareChunks(ip);

    // make all combination
    for(let v1 in ip.ranges[0]){
        for(let v2 in ip.ranges[1]){
            for(let v3 in ip.ranges[2]){
                for(let v4 in ip.ranges[3]){
                    ipv = ip.ranges[0][v1]+'.'+ip.ranges[1][v2]+'.'+ip.ranges[2][v3]+'.'+ip.ranges[3][v4];
                    if(payloads.indexOf(ipv)==-1) payloads.push(ipv);
                }
            }    
        }
    } 
};


// Exported method
$.generatePayloads = function(ip){
    let ips = parseIP(ip);
    let payloads = [];

    //console.log(ip,ips);
    if(ips.length == 0) 
        return null;

    for(let k=0; k<ips.length; k++){
        generatePayloadsFor(ips[k], payloads);    
    } 
    
    return payloads;
}
 
module.exports = $;
