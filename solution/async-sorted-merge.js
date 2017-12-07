'use strict'
const customSorts = require('./customSorts');
const fetchSize = 50;
/**
 * Challenge Number 2!
 *
 * Very similar to Challenge Number 1, except now you should assume that a LogSource
 * has only one method: popAsync() which returns a promise that resolves with a LogEntry,
 * or boolean false once the LogSource has ended.
 */

module.exports = (logSources, printer) => {  
  printLogs(logSources, printer);
}
/* The risks with this method are:
 * 1) later buffer batches may contain logEntries chronologically earlier than those that have already been printed
 * 2) the buffer may exceed the space allocated
 * In order to balance between these two problems, I am nipping off bite-sized chunks of the buffer and printing them out.
 * Because later fetches of the buffer are less likely to contain chronologically earlier logEntries, I can (slowly) 
 * increase the quantity of logEntries pulled from the buffer and keep it at a reasonable size.
 */
async function printLogs(logSources, printer){
  let left;
  //nextLogGroup just needs a single value so it runs the first time.
  let nextLogGroup = [0];
  //each fetchLogs gets 50 logEntries from each logSource. This is tweaked for the given dataset.
  let bufferedLogs = await fetchLogs(logSources);
  //readAmount is how many logs to print out at once. It starts at 10% of the buffer and grows.
  const initialReadAmount = logSources.length*(fetchSize/10);
  let readAmount = initialReadAmount;
  
  while (bufferedLogs.length > 0){
    bufferedLogs.sort(customSorts.compareDates);
    //splice out as much of the buffer as possible without risking a printing error
    left = bufferedLogs.splice(0,readAmount);
    /*grow readAmount each time, in an effort to keep the buffer under control.
    it caps at the size of one of the fetches */
    if (readAmount < logSources.length*fetchSize){
      readAmount += initialReadAmount;
    }
    //if the logGroup ever returns empty, we've drained all the logs, so just print out the buffer's contents.
    if (nextLogGroup.length > 0){
      //add another group of logs to the buffer
      nextLogGroup = await fetchLogs(logSources);
      bufferedLogs = bufferedLogs.concat(nextLogGroup);
    }
    else{
      readAmount = bufferedLogs.length;
    }
    
    //print out the spliced logEntries.
    left.forEach(function (source, index){    
        printer.print(source.log);           
    });
    
  }
    
  printer.done();
}

/*
 * LogEntries come back as an array of subarrays, merge them.
 */
async function fetchLogs(logSources) {
  let logs = await Promise.all(logSources.map(fetchEntriesFromSource));
  let mergedLogs = logs[0];

  for(let i = 1;i<logs.length;i++){
    mergedLogs = mergedLogs.concat(logs[i]);
  }
  if (mergedLogs.length>0){
    return mergedLogs;
  }
  return [];
} 

/*
 * Grab a number of logEntries per source as set in the 
 * configuration above. Trying not to let the buffer grow too quickly
 * lest the space allocation be exceeded
 */
async function fetchEntriesFromSource(logSource) {
  let result = [];
  let i = 0;
     
  while (!logSource.drained && i < fetchSize) {
    const logEntry = {'log':await logSource.popAsync()};
    if (logEntry.log) {
      result.push(logEntry);      
    }
    i++;
  }
  return result;
}


/* Practical testing results 100 sources.
Sync:
***********************************
Logs printed:            23999
Time taken (s):          26.241
Logs/s:                  914.5611828817499
***********************************
Async:
***********************************
Logs printed:            23883
Time taken (s):          147.703
Logs/s:                  161.69610637563218
***********************************
*/