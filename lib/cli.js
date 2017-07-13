/*
Home made arg parser 
(fait sur le coin de la table, desole d'avance ^_^)
----
@author : FrenchYeti
@date : 2017/02/07
*/
var ArgParser = {
    STR: String,
    ONE: 1,
    NONE: null
};

// Extend the array/hashmap/object from_o 
// with the properties of the array/hashmap/object with_o
// 
Object.extend = function(from_o, with_o, overwrite = false){
    for(let i in with_o){
        if(from_o[i] !== undefined && overwrite==false)
            continue;
        from_o[i] = with_o[i];
    }
};

ArgParser.parser = function(execname, cli_format, nodee_exec){
    let config = { immediate:[], implicit:[], opts:[], args:[], help:"", min:0 /*min:(execname==null)? 0 : 2*/ };
    let arg = null;

    if(execname != null)
        config.usage = "Usage : "+execname;
    else
        config.usage = "Plugin usage : ";
    

    for(let j in cli_format){
        arg = cli_format[j];
        
        // non dashed opts
        if(arg.arg == undefined) config.implicit.push(arg.name);           
            
        config.opts[arg.arg] = { name:arg.name, type:arg.data, callback:arg.callback };
        config.args[arg.name] = arg.default != undefined? arg.default : null ;
        config.min += (arg.required)? 1 : 0;   
        if(arg.arg != undefined){
            if(arg.data != ArgParser.NONE)            
                config.usage += (arg.required)? " "+arg.arg+" "+arg.name.toUpperCase() :" ["+arg.arg+" "+arg.name.toUpperCase()+"]";
            else
                config.usage += (arg.required)? " "+arg.arg :" ["+arg.arg+"]";
           
        }else{            
            config.usage += (arg.required)? " "+arg.name.toUpperCase() :" ["+arg.name.toUpperCase()+"]";
        }
        config.help += "\n\t"+((arg.arg != undefined)? arg.arg : arg.name.toUpperCase())+"\t\t"+arg.help;
    }    
    config.help = config.usage+"\n----------------------------\n"+config.help;
 
    return function(args){     
       
        let arg = null, i=0, size=0, roa=null;
        let ret = { help:config.help, error:true, opts: null, roa: null, }

        if(execname != null){
            args.shift();  
            args.shift();
        }

        roa = new Array().concat(args);
        size = args.length;
        end = 1;

        while(i < size){  
            if(config.opts[args[i]] != undefined){
                arg = config.opts[args[i]];
  
                if(arg.type == ArgParser.NONE){
                    config.args[arg.name] = true; 
                    roa.splice(0, 1);
                }else{
                    config.args[arg.name] = args[i+1];
                    roa.splice(0, 2);
                    i++;
                }

                if(arg.callback instanceof Function){
                    arg.callback(config);
                }
                
            }   
            // push implicit args (args without option) 
            else if(config.implicit.length > 0){
                config.args[config.implicit.pop()] = args[size-end];
                end++;
                roa.splice(roa.length-1, 1);                
            }
            i++;
        }
        if(args.length < config.min){
            //console.log(config.help);
            ret.roa = null;
            ret.opts = null;
            return ret;      
        }

        ret.opts = config.args;
        ret.roa = roa;

        ret.extendWith = function(args){
            Object.extend(ret.opts, args.opts, false);
            Object.extend(ret.roa, args.roa, false);
        };

        ret.error = false;
        return ret;              
    };
}


ArgParser.extend = function(arguments, opts){
    extendArgs = (ArgParser.parser(null, opts))(arguments.roa);    
    
    if(extendArgs != undefined){
        Object.extend(arguments.opts, extendArgs.opts);
    }    
    //console.log("Pass ",arguments.roa);    
    return { 
        opts: arguments.opts,
        roa: extendArgs.roa
    };
}

module.exports = ArgParser;
