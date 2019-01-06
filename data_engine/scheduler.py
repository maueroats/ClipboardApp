from apscheduler.schedulers.twisted import TwistedScheduler
from apscheduler.events import EVENT_JOB_MISSED
from twisted.internet import reactor
from dateutil.relativedelta import relativedelta
from data_aggregators.apis.library_events import LibraryEvents
from data_aggregators.apis.greatlakes_ical import GreatLakesReader
from data_aggregators.apis.lwv_chicago import LWVChicago
from data_aggregators.clipboard_scrapers.spiders.history_spider import HistorySpider
from data_aggregators.clipboard_scrapers.spiders.wpbcc_spider import WpbccSpider
#from data_aggregators.clipboard_scrapers.spiders.lwvchicago_spider import LWVchicago
from threading import Lock
from datetime import datetime
from scrapy.crawler import CrawlerRunner
from scrapy.utils.project import get_project_settings
from scrapy.utils.log import configure_logging

class Scheduler:
    def __init__(self):
        #self.scrapers = [HistorySpider, WpbccSpider, LWVchicago, LibraryEvents, GreatLakesReader]
        self.scrapers = [LWVChicago]
        self.start_date = datetime.now().strftime('%m-%d-%Y')
        self.end_date = (datetime.now() + relativedelta(months=+1)).strftime('%m-%d-%Y')
        self.interval_seconds = 60

        self.scheduler = TwistedScheduler()
        self.scheduler.add_listener(self.schedule_missed, EVENT_JOB_MISSED)
    
    def add_schedule(self, scraper, seconds_delay):
        self.scheduler.add_job(self.run_scraper, 
                id=scraper.__name__, 
                trigger='interval', 
                args=[scraper], 
                start_date=datetime.now() + relativedelta(seconds=seconds_delay if seconds_delay > 0 else 1), 
                seconds=self.interval_seconds)
        
    def schedule_missed(self, event):
        print(f'{event.job_id} missed. Interval time: {self.interval_seconds}')

    def run_scraper(self, scraper):
        print('starting ' + scraper.__name__)
        runner = CrawlerRunner(get_project_settings())
        runner.crawl(scraper, self.start_date, self.end_date)
        runner.join()
    
    def run_schedule(self):
        configure_logging()
        start_interval = self.interval_seconds / len(self.scrapers)
        now = datetime.now()
        self.last_scheduled = now
        for index, scraper in enumerate(self.scrapers):
            self.add_schedule(scraper, start_interval * index)
        
        self.scheduler.start()
        reactor.run()