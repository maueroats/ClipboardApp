
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



