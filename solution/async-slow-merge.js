'use strict'
const customSorts = require('./customSorts');
/**
 * Challenge Number 2!
 *
 * Very similar to Challenge Number 1, except now you should assume that a LogSource
 * has only one method: popAsync() which returns a promise that resolves with a LogEntry,
 * or boolean false once the LogSource has ended.
 */

/*
 * This file has only two major changes from the sync solution, and is otherwise a direct conversion.
 * I've removed the comments and recommented the parts that are different from sync
 */
module.exports = (logSources, printer) => {
  
  printLogs(logSources, printer);

}


async function printLogs(logSources, printer){ 
  let currentLogs = [];
  let insert = null;
  /*
   * this section is changed from the sync version. It is just a straight rewrite.
   */
  let firstLogs = await Promise.all(logSources.map(source => source.popAsync()));
  
  firstLogs.forEach(function (log, index){
    currentLogs[index] = {index:index, log:log};
  });  

  currentLogs.sort(customSorts.compareDates);
  
  currentLogs.reverse();
  
  while (currentLogs[currentLogs.length-1]){
    
    try {
      printer.print(currentLogs[currentLogs.length-1].log);
    }
    catch (err){
      console.log(err);
      return;
    }
    /*
     * this is the other line changed from the sync version.
     * I did try dropping the await here to speed it up, but that just causes inevitable crashes.
     */
    currentLogs[currentLogs.length-1].log = await logSources[currentLogs[currentLogs.length-1].index].popAsync();
    
    if (currentLogs[currentLogs.length-1].log){      
      insert = currentLogs.pop();
      customSorts.customBinaryInsert(insert, currentLogs);
    }
    else{      
      currentLogs.pop();
    }     
  }
  
  printer.done();

}
