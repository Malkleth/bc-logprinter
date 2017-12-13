module.exports = {
  /*
   * customized binary insert. It is paranoid and kills the process if a logEntry is dropped.
   */
  customBinaryInsert: function(value, array, startVal, endVal){
    binaryInsert(value, array, startVal, endVal);    
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

/*
 * modified from 
 * https://machinesaredigging.com/2014/04/27/binary-insert-how-to-keep-an-array-sorted-as-you-insert-data-in-it/
 */
function binaryInsert(value, array, startVal, endVal){

    var length = array.length;
    var start = typeof(startVal) != 'undefined' ? startVal : 0;
    var end = typeof(endVal) != 'undefined' ? endVal : length - 1;//!! endVal could be 0 don't use || syntax
    var m = start + Math.floor((end - start)/2);
    
    if(length == 0){
      array.push(value);
      return;
    }
    
    if (value.log.date.getTime() == array[m].log.date.getTime()){
      array.splice(m + 1, 0, value);
      return;
    }
    
    if(value.log.date < array[end].log.date){
      array.splice(end + 1, 0, value);
      return;
    }

    if(value.log.date > array[start].log.date){//!!
      array.splice(start, 0, value);
      return;
    }

    if(start >= end){
      return;
    }

    if(value.log.date > array[m].log.date){
      binaryInsert(value, array, start, m - 1);
      return;
    }

    if(value.log.date < array[m].log.date){
      binaryInsert(value, array, m + 1, end);
      return;
    }
    
    /*
    * kill process if an insert is ignored
    */
    console.log('An insert has been ignored.');
    console.log(value.log.date);
    console.log(array[m].log.date, m)
    console.log(value.log.date.getTime() == array[m].log.date.getTime());
    console.log(array[end].log.date, end)
    console.log(array[start].log.date, start)
    process.exit();
  }