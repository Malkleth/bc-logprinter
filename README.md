

Libraries used: None! I did play around with LoDash a bit.
Solution files:
async-slow-merge.js - this is a straight conversion of my sync solution to async to complete the challenge.
async-sorted-merge.js - this is a much faster async solution, but it's tricky.
customSorts.js - a couple of supporting methods for sorting. Used in async-slow and sync.
sync-sorted-merge.js - synch solution to the first half of the challenge

For these notes
N = The total number of LogEntries
K = The total number of LogSources

Sync:

1) Set up an array of size K
2) Fill initial array with the first LogEntry from each LogSource.
3) Sort initial array. The array will be out of order, so javascript's default sort is fine.
4) Print the array element that corresponds to the logEntry with the earliest date.
5) pop() the next entry from the LogSource that was just printed. If the logsource is drained, drop it's spot in the array.
6) resort the array. It's mostly in order so a stable sort will be best.

repeat steps 4-6 until the initial array is empty as all LogSources have been drained.

I played around with various sorting methods for step 6. Specifically I tried Lodash's "sortByCollection" which is supposedly stable but was by far the slowest, and then javascript's default array.sort() method, which worked but was slow when sources got up to say, 100. Then I wrote my own - at first, because the array is in order except for the newest element, I tried bubble sort. If a newly popped LogEntry's spot is early in the array, Bubble sort is actually really quick - you might find the correct spot in only two or three comparisons. Alas, it was not, so as the sources scaled up it got much slower. Therefore I switched to binary insert, which will work in about O(log K) time (but very rarely will you get much lower than log K comparisons) and this provided much better performance.
Therefore, the sync solution runs in O(N*log K) time and O(K) space.

Async:
A straight conversion to async/await of the sync solution worked, but because of the overhead involved in promises, took 5x as long to run as the sync solution. Removing the awaits makes the conversion race ahead and crash on an unresolved Promise. So, trying alternate approach: Grabbing every single log entry at once blows up the javascript heap if it gets big enough. Using a buffer and printing groups works, but, printing out the entire buffer before getting the next batch is almost certain to cause out of order prints.  I therefore went with a little trickier approach: Buffer a bunch of log entries, and print out a few of them. Then grab the next group and sort them in to the buffer. Because later log entries are less and less likely to interweave with log entries from earlier fetches, you can slowly grow the amount read out from the buffer at one time. This helps manage the buffer size, (which is still a fraction of N) and how much you can manage it depends on the data. Using the provided LogSources I got the max buffer to about 80% of N.

Steps for the faster solution:
1) For each LogEntry, get the first 50 (configurable number) logs.
2) Make these into a big array.
3) Sort said array (it's out of order, so array.sort() is fine).
4) Print a relatively small amount of the buffer - 10% - this can grow every repeated step
5) get the next buffer batch of 50 logs per LogSource.

repeat steps 3-5 until the method that fetches the logEntries reports that there are no more to fetch.
Cap the size of the printing to the size of the fetch to make sure no out of order prints occur.
At that point, just sort one last time and print out the rest of the logEntries.

This runs in something like O(N + log N) time and O(N) space, but the space requirement is a fraction of N rather than a multiplier.

Because this solution isn't ideal (it's tough to guarantee all prints will come out in order, and it's pretty easy to blow javascript's heap) I've also included my much slower solution that's just a direct conversion of the sync. That, at least will be functional all the time.


Below is some test data. I tried to make apple to apple comparisons here but the times will vary based on how much space my machine had free at any given moment.

** Sync  - 10,000 sources **
***********************************
Logs printed:            2314698
Time taken (s):          3066.87
Logs/s:                  754.7427833589295
***********************************

** Async - 10,000 sources **
***********************************
Logs printed:            2407803
Time taken (s):          3212.386
Logs/s:                  749.5372598436178
***********************************


** Async - slow version - 1000 sources. **

***********************************
Logs printed:            240518
Time taken (s):          1487.639
Logs/s:                  161.67766507869183
***********************************

** Sync test results - 100 sources. **
Lodash sort:

***********************************
Logs printed:            23795
Time taken (s):          47.84
Logs/s:                  497.387123745
***********************************

Default sort:
***********************************
Logs printed:            23877
Time taken (s):          20.821
Logs/s:                  1146.774890
***********************************

Custom (bubble) sort:
***********************************
Logs printed:            23970
Time taken (s):          3.506
Logs/s:                  6836.8511123
***********************************

Custom (binary) insert:
***********************************
Logs printed:            23353
Time taken (s):          3.012
Logs/s:                  7753.320053120
***********************************

** Sync - 1000 sources **
Lodash: Yeah, this took about three hours.
***********************************
Logs printed:            240830
Time taken (s):          10373.769
Logs/s:                  23.2152846
***********************************

array.sort():
I didn't bother, since, I guesstimated it would take 1.5 hours instead of 3 hours.

Custom bubble sort:
***********************************
Logs printed:            241260
Time taken (s):          224.577
Logs/s:                  1074.286324
***********************************

Custom - binary insert

***********************************
Logs printed:            239483
Time taken (s):          42.404
Logs/s:                  5647.651164
***********************************
