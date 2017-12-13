module.exports = {
  /*
   * customized binary insert. It is paranoid and kills the process if a logEntry is dropped.
   */
  customBinaryInsert: function(logEntry, logs){
    if(logs.length == 0){
      logs.push(logEntry);
      return;
    }
    
    let start = 0;
    let end = logs.length-1;
    let middle;
    let previousStart;
    let previousEnd;
    
    while (start != previousStart || end != previousEnd){
      previousStart = start;
      previousEnd = end;
      middle = (start+end) >> 1;
      try{
        if (logs[middle].log.date > logEntry.log.date ){
          start = middle;
        }
        if (logs[middle].log.date < logEntry.log.date ){
          end = middle;
        }
      }
      catch (err){
        console.log(err);
        console.log('Middle:' + middle+ ' logsmid: '+logs[middle]);
        console.log('Start:' + start+ ' end: '+end);
        console.log('PrevStart:' + previousStart+ ' PrevEnd: '+previousEnd);
        process.exit();
      }
    }
    
    /*
     * handle duplicates, put nonduplicates in their proper location.
     */
    if (logEntry.log.date > logs[start].log.date){
      logs.splice(start, 0, logEntry);
      return;
    }
    if (logEntry.log.date < logs[end].log.date){
      logs.splice(end + 1, 0, logEntry);
      return;
    }
    if (logEntry.log.date == logs[middle].log.date){
      logs.splice(middle + 1, 0, logEntry);
      return;
    }
    if (logEntry.log.date < logs[start].log.date && logEntry.log.date > logs[end].log.date){
      logs.splice(start+1, 0, logEntry);
      return;
    }
    
    /*
     * This makes certain that the binary insert doesn't drop any logEntries.
     */
    process.exit();
    
  },

  /*
   * this is a comparison function for use in array.sort()
   */
  compareDates: function (a, b){
    if (a.log.date < b.log.date){return -1;}
    if (a.log.date > b.log.date){return 1;}
    if (a.log.date == b.log.date){return 0;}
  }
}