
# Volunteer Map Orientation

This document is a walkthrough of the codebase.

* event processor
* event service

## Event Processor

This is a Python codebase built on the `scrapy` package, then packaged
up with Docker.

* apis
* base
* graphql definitions
* models
* scrapers
* scrapy impl
* util

### Configuration Variables

These from `config.py`. Annotating where they are used and what they
do. (Complexity = 1)

* `config.spider_name`: Activate the one named spider. None activates
  all! (runner.py). 
* `config.debug`: Activates Python Tools for Visual Studio remote
  debugging server in runner.py. 

NOTE: `self.verbose_scrapy_output` is set twice.

### Top Level

* `runner.py`: Loads configuration and runs spiders. Complexity = 2.

* `create_schedules.py`: Schedule spider jobs. Complexity = 3. 

     Includes `Schedule` class. It would be useful if the meaning of
     the parameters for this class were documented. Especially
     "interval", "delta" and "offset". 
     Use of format strings in `__init__` seems strange -
     these need tests to make sure they are working as expected. I
     think the author expects math to be done where only substitution
     is occurring in the f-strings.

     Includes debugging support, snake case conversion, enabled spider
     selection (no use of environment variable?). Does not actually do
     work, interacts with the "ndscheduler" service. Given how little
     it does, this file seems quite complex.

* `entrypoint.sh`

     There is a bunch of removing at the start. Why? 
     
     Looks like it does two things, depending on the value of
     the `RUN_SCHEDULER` environment variable.
     
       * Value of "1"
       creates schedules and then runs `scrapyd-deploy`, then wait
       forever.
   
       * Otherwise execute `runner.py`, which appears to run spider(s)
         without any delay or repeated schedule.


    NOTES: This kind of behavior should be documented (or avoided!). 

* `runner.py`

    Run spider(s) immediately. Can use `config.spider_name` to run
    just one.


### Top Level Misc Configuration Files

* `nodemon.json`: Configures `nodemon` to auto-reload your Node.js app
  when the files on disk are changed.

* `package.json`: For the event processor app.

* `requirements.txt`: For Python.

* `settings.py`: Config for Scapy. Includes cache (controlled by
  another config). Sets up scapy log fomatter and log level. Includes
  scrapers and apis directories.

### apis

* `greatlakes_ical`: Complexity = 1 but class variable behavior should
  be confirmed.
  
* `honeycomb`: 

### base

Scrapy.spiders.

* `aggregator_base.py`: AggregatorBase class. Complexity = 4.

    * `is_errored`: any logged message has level `ERROR`. See notes
      below. (!)

    * Includes debugging attachment code.
    * Remembers date format.
    * `formatter` class variable for logging formatter.
    * Local `start_date` variable set to now. (!)
    * Local `end_date` variable set to one month in the future. (!)
    * Converted into instance variable
    * Configures loggers.
    * Action: `notify_spider_complete`.
    * Question: memory handler vs stream handler for log. I think the
      logging handlers are misconfigured - the memory handler is
      supposed to wrap the stream handler, and the stream handler is
      supposed to send the output somewhere (it defaults to
      stderr). 
    * Note: creation of a MemoryHandler that buffers 0 log messages
      does not seem to make sense. That flushes every time it checks
      to see if it is supposed to flush (no buffering). See
      [BufferHandler source code](https://svn.python.org/projects/python/trunk/Lib/logging/handlers.py).
    * NOTE: The use of the `buffer` attribute of a `MemoryHandler` seems
      like a bad idea. It's not in the documented interface. Just keep
      track of "fatal" errors yourself. (Should be in one place,
      right?) (!)
    * NOTE: I think setting the time in the constructor is
      wrong. Constructors should not do "work" as a rule. Do you
      really want the time the spider was made (vs when it ran)?

* `api_base.py`: ApiBase, which inherits from
  AggregatorBase. Complexity = 2.
  
      * Use of class variables for allowed domains - does overriding
        work as desired? 
      * `parse_response_json`: Deliberately choose not to return a
        list when there is one element? Doesn't that choice make other
        things more confusing? Always need to check return type to
        use.
      * `get_response_json`: Same behavior, uses parse response json.
      * `get_response_graphql`: Run a GraphQL query.

* `custom_spiders.py`: Skeleton `ApiSpider`, `ScraperSpider`,
  `ScraperCrawlSpider` classes. Complexity = 1.
  
* `spider_base.py`: Complexity = 2 (only because of comments below,
  could be 1).

      * `extract_multiple`: Is this tested? type of `name_funcs` appears
        to be `Dict: Unknown -> (name, func)` because you are iterating
        over `name_funcs.values()`. Should the iteration be
        over `name_funcs.items()`? Yes, that's the way it's used in
        the Great Lakes spider.
      * Understanding this code requires knowing the internal format
        of the data you expect to receive. (E.g., what is the need for
        the xpath selector function, and the meaning of the
        complicated-looking paths in `wpbcc_spider.py`.
      * `create_time_data` appears to use the "first" keyword args
        value. Order keywords appear in should not matter? I think
        this function should use `*args` not `**kwargs`.

### scrapers

* greatlakes: Obsolete.
* history: ChicagoHistory.org. 

    Uses spider's start and end date.

* wpbcc

### scrapy impl

* middlewares: Count events and process. Complexity = 1.

    * Why is it important that the counts be the same in each row?

* pipelines. Includes caching, time frame filtering,
  geocode pipeline. Complexity = 3!

     * This stuff should all be separated!?
     * Info-level logging of errors in processing = wrong level?
     * Raise plain old `Exception` if anything goes wrong? Crude.

* polite log formatter. How to log dropped messages. Complexity = 1. 

### util

* cache call: Uses Beaker to cache calls. Complexity = 1.

    * Note: caching is controlled with an API config variable.
    * Note: it looks like this code tries to survive errors
    by skipping cache attempt. What kind of errors are expected? As
    written, expecting both errors in target function and cache to be
    caught... 

* data utils: Use BeautifulSoup to clean up HTML or work with
  JSON. Complexity = 2.

    * Note: `remove_whitespace` does more than its name indicates,
    be careful or fix naming.
    * Several functions here act differently on lists and strings as
    input. That's not usually the right way to do things. Recommend
    cleanup.

* HTTP Utils. Define `HttpUtils`. Internally (?) defines
  `RequestAdapter` a subclass of `HTMLAdapter`. Complexity = 1.

     * Note: Dispatch on explicitly queried types. Conversion between
       "snake case" and "camel case" is happening here. Why??


* Object Hash: Maintains an on-disk pickled hash table in
  `/tmp/hashes`. Complexity = 1.

     * Note: provides a way to compute the hash value of an object but
       does not automatically use this value when making the hash
       table (neither key nor value)?
     * Note: reading the whole table from disk each time can't be a
       good idea in `set`. Recommend fix or delete this part of the
       codebase.

* Switchable Decorator: Complexity = 1. Only used in `cache_call`.



