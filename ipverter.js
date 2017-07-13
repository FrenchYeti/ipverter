#!/usr/bin/node
'use strict';

var ps=require('process'),
	ArgParser=require('./lib/cli.js'),
    IPV=require('./lib/core.js');

var Arguments = (ArgParser.parser("ipverter.js",[{
        name:'help', 
        data: ArgParser.NONE,
        arg: '--help', 
        help:'Print help',
        callback: (opts)=>{ console.log(opts.help); ps.exit(0); }
    },{ 
        name:'longip', 
        arg:'-l',
        default: false, 
        data: ArgParser.NONE, 
        help:'Include long notation (127.0.0.1 => )',
        callback: IPV.addOptLong
    },/*{ 
        name:'smart', 
        arg:'-s', 
        default: false,
        data: ArgParser.NONE, 
        help:'Smart mode exclude notation with same regexp',
        callback: IPV.addOptSmart
    },{ 
        name:'regular', 
        arg:'-r', 
        default: false,
        data: ArgParser.NONE, 
        help:'Make only regular IP notation (each chunk is encoded in a same way)',
        callback: IPV.addOptRegular    
    },*/{ 
        name:'padding', 
        arg:'-p', 
        default: false,
        data: ArgParser.NONE, 
        help:'Add extra padding to the each parts',
        callback: IPV.addOptPadding    
    },{ 
        name:'counter', 
        arg:'-c', 
        default: false,
        data: ArgParser.NONE, 
        help:'Only count the number of payloads',
        callback: IPV.addOptPadding    
    },{ 
        name:'ip',
        required:true, 
        data: ArgParser.STR, 
        help:'IP address in decimal dotted notation (support CIDR notation)',
    }]))(ps.argv);



if(Arguments.opts == null){
    console.log(Arguments.help);
    ps.exit(0);
}

var Opts=Arguments.opts;

let payloads = IPV.generatePayloads(Opts.ip);

// output
if(!Opts.counter){
    for(let i in payloads)    console.log(payloads[i]);
}else{
    console.log("---------------------------------------\n"+payloads.length+" payloads");
}

 
