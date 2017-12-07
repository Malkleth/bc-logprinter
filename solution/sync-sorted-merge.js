'use strict'
const customSorts = require('./customSorts');


module.exports = (logSources, printer) => {
  /* 
   * create an array 'currentLogs'. the members of the array are objects with the property 'index' which 
   * corresponds to the logSources array indices, and the 'log' property is the most recently popped logEntry for
   * that index.
   */
  let currentLogs = [];
  let insert = null;  
  
  /*
   * fill in with popped logs. I am gonna assume that each LogSource has at least 1 log in it here.
   */
  logSources.forEach(function (source, index){
    let log = source.pop();
    currentLogs[index] = {index:index, log:log};
  });     

  
  /* 
   * now, sort that currentLogs array. For the initial sort, there's no benefit to my customBinaryInsert method, 
   * so I use the default javascript sort. 
   */
  currentLogs.sort(customSorts.compareDates);
  
  /* 
   * reverse the array. This lets us use array.pop() instead of array.shift() and saves renumbering currentLogs
   * when dropping drained sources. it does make the code a bit less readable however.
   */
  currentLogs.reverse();
  
  /* 
   * currentLogs[currentLogs.length-1] is now chronologically first of all the current log entries (each the most
   * recent unprinted log in their own log source). 
   */
  while (currentLogs[currentLogs.length-1]){
    try{      
      printer.print(currentLogs[currentLogs.length-1].log);
    }
    catch (err){
      console.log(err);
      return;
    }
    /*
     * replace the log that has just printed with the next log from its logSource.
     * That logsource will be referenced by the index property in the currentLogs object.     
     */
     
    /*
     * this is logSource.pop() - required to read through the next log.
     */
    currentLogs[currentLogs.length-1].log = logSources[currentLogs[currentLogs.length-1].index].pop();
    /*
    * if the logSource is drained, just remove it from currentLogs. 
    * Only resort the array if it is out of it's sorted state.
    */
    if(currentLogs[currentLogs.length-1].log){
      /*
       * this is also array.pop() - slice off the right end of the currentLogs array and reinsert 
       * it in its proper place. This will maintain the sorted state of the array.
       */
      insert = currentLogs.pop();
      customSorts.customBinaryInsert(insert, currentLogs);
    }
    else{
      /*      
       * Note that this is array.pop() 
       */
      currentLogs.pop();
    }     
  } 
  
  printer.done();

}


